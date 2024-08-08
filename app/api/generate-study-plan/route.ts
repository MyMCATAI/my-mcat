import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/prismadb";

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Fetch necessary data
    const studyPlan = await prisma.studyPlan.findFirst({
      where: { userId },
    });

    if (!studyPlan) {
      return NextResponse.json({ error: "No study plan found" }, { status: 404 });
    }

    const knowledgeProfiles = await prisma.knowledgeProfile.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { conceptMastery: 'asc' }
    });

    const content = await prisma.content.findMany();

    // 2. Process StudyPlan data
    const today = new Date();
    const examDate = new Date(studyPlan.examDate);
    const totalDays = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    const hoursPerDay = JSON.parse(studyPlan.hoursPerDay as string);
    const fullLengthDays = JSON.parse(studyPlan.fullLengthDays);
    
    const totalStudyHours = calculateTotalStudyHours(hoursPerDay, fullLengthDays, totalDays);

    // 3. Sort categories (already done in knowledgeProfiles query)

    // 4. Allocate study time for each category
    const categoryAllocation = allocateStudyTime(knowledgeProfiles, totalStudyHours);

    // 5. Select appropriate Content for each category
    const selectedContent = selectContent(categoryAllocation, content);

    // 6. Generate CalendarActivities
    const calendarActivities = generateCalendarActivities(selectedContent, studyPlan, today);

    // 7. Save CalendarActivities to the database
    await prisma.calendarActivity.createMany({
      data: calendarActivities
    });

    return NextResponse.json({ message: "Study plan generated successfully" }, { status: 200 });
  } catch (error) {
    console.error('Error generating study plan:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function calculateTotalStudyHours(hoursPerDay: number[], fullLengthDays: boolean[], totalDays: number): number {
  let totalHours = 0;
  for (let i = 0; i < totalDays; i++) {
    const dayOfWeek = (i + new Date().getDay()) % 7;
    totalHours += fullLengthDays[dayOfWeek] ? hoursPerDay[dayOfWeek] : hoursPerDay[dayOfWeek] / 2;
  }
  return totalHours;
}

function allocateStudyTime(knowledgeProfiles: any[], totalStudyHours: number): any[] {
  const totalMastery = knowledgeProfiles.reduce((sum, profile) => sum + (1 - (profile.conceptMastery || 0)), 0);
  return knowledgeProfiles.map(profile => ({
    ...profile,
    allocatedHours: totalStudyHours * ((1 - (profile.conceptMastery || 0)) / totalMastery)
  }));
}

function selectContent(categoryAllocation: any[], content: any[]): any[] {
  return categoryAllocation.map(category => {
    const categoryContent = content.filter(c => c.categoryId === category.categoryId);
    let remainingHours = category.allocatedHours;
    const selected = [];

    while (remainingHours > 0 && categoryContent.length > 0) {
      const randomIndex = Math.floor(Math.random() * categoryContent.length);
      const selectedContent = categoryContent[randomIndex];
      
      if (selectedContent.minutes_estimate / 60 <= remainingHours) {
        selected.push(selectedContent);
        remainingHours -= selectedContent.minutes_estimate / 60;
        categoryContent.splice(randomIndex, 1);
      } else {
        break;
      }
    }

    return {
      category: category.category,
      content: selected
    };
  });
}

function generateCalendarActivities(selectedContent: any[], studyPlan: any, startDate: Date): any[] {
  const activities = [];
  let currentDate = new Date(startDate);
  const hoursPerDay = JSON.parse(studyPlan.hoursPerDay as string);
  const fullLengthDays = JSON.parse(studyPlan.fullLengthDays);

  for (const categoryContent of selectedContent) {
    for (const content of categoryContent.content) {
      while (true) {
        const dayOfWeek = currentDate.getDay();
        const availableHours = fullLengthDays[dayOfWeek] ? hoursPerDay[dayOfWeek] : hoursPerDay[dayOfWeek] / 2;

        if (content.minutes_estimate / 60 <= availableHours) {
          activities.push({
            userId: studyPlan.userId,
            studyPlanId: studyPlan.id,
            categoryId: categoryContent.category.id,
            contentId: content.id,
            activityText: `Study ${content.title}`,
            activityTitle: content.title,
            hours: content.minutes_estimate / 60,
            activityType: content.type,
            link: content.link,
            scheduledDate: new Date(currentDate),
            status: "Not Started"
          });

          currentDate.setHours(currentDate.getHours() + content.minutes_estimate / 60);
          break;
        } else {
          currentDate.setDate(currentDate.getDate() + 1);
          currentDate.setHours(9, 0, 0, 0); // Reset to 9 AM for the next day
        }

        if (currentDate >= studyPlan.examDate) {
          break;
        }
      }

      if (currentDate >= studyPlan.examDate) {
        break;
      }
    }

    if (currentDate >= studyPlan.examDate) {
      break;
    }
  }

  return activities;
}