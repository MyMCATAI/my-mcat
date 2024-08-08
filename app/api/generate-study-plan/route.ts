import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/prismadb";

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("1. Starting study plan generation for user:", userId);

    // 1. Fetch necessary data
    console.log("2. Fetching study plan...");
    const studyPlan = await prisma.studyPlan.findFirst({
      where: { userId },
    });

    if (!studyPlan) {
      console.log("No study plan found for user:", userId);
      return NextResponse.json({ error: "No study plan found" }, { status: 404 });
    }
    console.log("Study plan found:", studyPlan.id);

    console.log("3. Fetching knowledge profiles...");
    const knowledgeProfiles = await prisma.knowledgeProfile.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { conceptMastery: 'asc' }
    });
    console.log("Knowledge profiles fetched:", knowledgeProfiles.length);

    console.log("4. Fetching content...");
    const content = await prisma.content.findMany();
    console.log("Content items fetched:", content.length);

    // 2. Process StudyPlan data
    console.log("5. Processing study plan data...");
    const today = new Date();
    const examDate = new Date(studyPlan.examDate);
    const totalDays = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    // Parse hoursPerDay
    let hoursPerDay: { [key: string]: number };
    try {
      hoursPerDay = JSON.parse(studyPlan.hoursPerDay as string);
    } catch (error) {
      console.error("Error parsing hoursPerDay:", error);
      hoursPerDay = {
        Sunday: 2, Monday: 2, Tuesday: 2, Wednesday: 1,
        Thursday: 2, Friday: 2, Saturday: 2
      };
    }

    // todo Parse fullLengthDays
    // const fullLengthDays = (studyPlan.fullLengthDays as string)
    //   .split('')
    //   .map(char => char === '1');
    
    const totalStudyHours = calculateTotalStudyHours(hoursPerDay, totalDays);
    console.log("Total study days:", totalDays, "Total study hours:", totalStudyHours);

    // 3. Sort categories (already done in knowledgeProfiles query)
    console.log("6. Categories sorted by concept mastery (ascending):");
    knowledgeProfiles.forEach(profile => {
      console.log(`- ${profile.category.subjectCategory}: ${profile.conceptMastery}`);
    });

    // 4. Allocate study time for each category
    console.log("7. Allocating study time for each category...");
    const categoryAllocation = allocateStudyTime(knowledgeProfiles, totalStudyHours);
    categoryAllocation.forEach(allocation => {
      console.log(`- ${allocation.category.subjectCategory}: ${allocation.allocatedHours.toFixed(2)} hours`);
    });

    // 5. Select appropriate Content for each category
    console.log("8. Selecting appropriate content for each category...");
    const selectedContent = selectContent(categoryAllocation, content);
    selectedContent.forEach(category => {
      console.log(`- ${category.category.subjectCategory}: ${category.content.length} items selected`);
    });

    // 6. Generate CalendarActivities
    console.log("9. Generating calendar activities...");
    const calendarActivities = generateCalendarActivities(selectedContent, studyPlan, today);
    console.log("Total calendar activities generated:", calendarActivities.length);

    // 7. Save CalendarActivities to the database
    console.log("10. Saving calendar activities to the database...");
    await prisma.calendarActivity.createMany({
      data: calendarActivities
    });
    console.log("Calendar activities saved successfully");

    return NextResponse.json({ message: "Study plan generated successfully" }, { status: 200 });
  } catch (error) {
    console.error('Error generating study plan:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function calculateTotalStudyHours(
  hoursPerDay: { [key: string]: number },
  // fullLengthDays: boolean[],
  totalDays: number
): number {
  console.log("Calculating total study hours...");
  let totalHours = 0;
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  for (let i = 0; i < totalDays; i++) {
    const dayOfWeek = (i + new Date().getDay()) % 7;
    const dayName = daysOfWeek[dayOfWeek];
    // totalHours += fullLengthDays[dayOfWeek] ? hoursPerDay[dayName] : hoursPerDay[dayName] / 2;
    totalHours += hoursPerDay[dayName]
  }
  console.log("Total study hours calculated:", totalHours);
  return totalHours;
}

function allocateStudyTime(knowledgeProfiles: any[], totalStudyHours: number): any[] {
  console.log("Allocating study time based on knowledge profiles...");
  const totalMastery = knowledgeProfiles.reduce((sum, profile) => sum + (1 - (profile.conceptMastery || 0)), 0);
  return knowledgeProfiles.map(profile => ({
    ...profile,
    allocatedHours: totalStudyHours * ((1 - (profile.conceptMastery || 0)) / totalMastery)
  }));
}

function selectContent(categoryAllocation: any[], content: any[]): any[] {
  console.log("Selecting content for each category...");
  return categoryAllocation.map(category => {
    const categoryContent = content.filter(c => c.categoryId === category.categoryId);
    let remainingHours = category.allocatedHours;
    const selected = [];

    console.log(`- Category: ${category.category.subjectCategory}, Allocated hours: ${remainingHours.toFixed(2)}`);

    while (remainingHours > 0 && categoryContent.length > 0) {
      const randomIndex = Math.floor(Math.random() * categoryContent.length);
      const selectedContent = categoryContent[randomIndex];
      
      if (selectedContent.minutes_estimate / 60 <= remainingHours) {
        selected.push(selectedContent);
        remainingHours -= selectedContent.minutes_estimate / 60;
        categoryContent.splice(randomIndex, 1);
        console.log(`  Selected: ${selectedContent.title} (${(selectedContent.minutes_estimate / 60).toFixed(2)} hours)`);
      } else {
        break;
      }
    }

    console.log(`  Total selected: ${selected.length} items, Remaining hours: ${remainingHours.toFixed(2)}`);

    return {
      category: category.category,
      content: selected
    };
  });
}

function generateCalendarActivities(selectedContent: any[], studyPlan: any, startDate: Date): any[] {
  console.log("Generating calendar activities...");
  const activities = [];
  let currentDate = new Date(startDate);
  
  // Parse hoursPerDay
  let hoursPerDay: { [key: string]: number };
  try {
    hoursPerDay = JSON.parse(studyPlan.hoursPerDay as string);
  } catch (error) {
    console.error("Error parsing hoursPerDay:", error);
    hoursPerDay = {
      Sunday: 2, Monday: 2, Tuesday: 2, Wednesday: 1,
      Thursday: 2, Friday: 2, Saturday: 2
    };
  }

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  let contentIndex = 0;
  let categoryIndex = 0;
  let isStudy = true; // Toggle between "study" and "practice"

  while (currentDate < studyPlan.examDate) {
    const dayOfWeek = currentDate.getDay();
    const dayName = daysOfWeek[dayOfWeek];
    const availableHours = hoursPerDay[dayName];
    let dailyActivities = 0;
    let dailyHours = 0;

    while (dailyActivities < 2 && dailyHours < availableHours && categoryIndex < selectedContent.length) {
      const categoryContent = selectedContent[categoryIndex];
      const content = categoryContent.content[contentIndex];

      if (!content) {
        categoryIndex++;
        contentIndex = 0;
        continue;
      }

      const contentHours = content.minutes_estimate / 60;

      if (dailyHours + contentHours <= availableHours) {
        const activityType = isStudy ? 'Study' : 'Practice';
        
        activities.push({
          userId: studyPlan.userId,
          studyPlanId: studyPlan.id,
          categoryId: categoryContent.category.id,
          contentId: content.id,
          activityText: `${activityType} ${content.title}`,
          activityTitle: `${activityType} ${content.title}`,
          hours: contentHours,
          activityType: content.type,
          link: content.link,
          scheduledDate: new Date(currentDate),
          status: "Not Started"
        });

        console.log(`Scheduled: ${activityType} ${content.title} on ${currentDate.toISOString().split('T')[0]} (${contentHours.toFixed(2)} hours)`);

        dailyActivities++;
        dailyHours += contentHours;
        contentIndex++;
        isStudy = !isStudy; // Toggle between "study" and "practice"
      } else {
        break;
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
    currentDate.setHours(9, 0, 0, 0); // Reset to 9 AM for the next day
  }

  console.log(`Total activities generated: ${activities.length}`);
  return activities;
}