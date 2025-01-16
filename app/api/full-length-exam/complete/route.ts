'use server';

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";
import { SectionCode } from "@/utils/examScores";

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Get all full length exams with their scores
    const [fullLengthExams, sectionAverages] = await Promise.all([
      // Get exams with their scores
      prisma.fullLengthExam.findMany({
        where: { userId },
        select: {
          id: true,
          title: true,
          createdAt: true,
          calendarActivity: {
            select: {
              scheduledDate: true,
            }
          },
          dataPulses: {
            select: {
              section: true,
              positive: true,
            }
          },
        },
        orderBy: {
          calendarActivity: {
            scheduledDate: 'asc'
          }
        }
      }),
      // Calculate section averages using SQL aggregation
      prisma.dataPulse.groupBy({
        by: ['section'],
        where: {
          userId,
          fullLengthExam: { isNot: null }, // Only include pulses from full length exams
          section: { in: ['CARs', 'P/S', 'C/P', 'B/B'] },
        },
        _avg: {
          positive: true,
        },
      })
    ]);

    // Process the data
    const processedData = {
      examScores: fullLengthExams.map(exam => ({
        id: exam.id,
        title: exam.title,
        createdAt: exam.createdAt,
        scheduledDate: exam.calendarActivity?.scheduledDate,
        totalScore: exam.dataPulses.reduce((sum, pulse) => sum + pulse.positive, 0),
        sectionScores: {
          CARs: exam.dataPulses.find(p => p.section === "CARs")?.positive ?? null,
          "Psych/Soc": exam.dataPulses.find(p => p.section === "P/S")?.positive ?? null,
          "Chem/Phys": exam.dataPulses.find(p => p.section === "C/P")?.positive ?? null,
          "Bio/Biochem": exam.dataPulses.find(p => p.section === "B/B")?.positive ?? null,
        }
      })),
      sectionAverages: {
        CARs: Math.round(sectionAverages.find(avg => avg.section === "CARs")?._avg.positive ?? 0) || null,
        "Psych/Soc": Math.round(sectionAverages.find(avg => avg.section === "P/S")?._avg.positive ?? 0) || null,
        "Chem/Phys": Math.round(sectionAverages.find(avg => avg.section === "C/P")?._avg.positive ?? 0) || null,
        "Bio/Biochem": Math.round(sectionAverages.find(avg => avg.section === "B/B")?._avg.positive ?? 0) || null,
      }
    };

    return Response.json(processedData);
  } catch (error) {
    console.error("[FULL_LENGTH_EXAM_GET]", error);
    return new Response("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { 
      calendarActivityId,
      title,
      scores: { cp, cars, bb, ps }
    } = body;

    // Validate that we have a calendar activity
    if (!calendarActivityId) {
      return new Response("Calendar Activity ID is required", { status: 400 });
    }

    // Verify the calendar activity exists and belongs to the user
    const calendarActivity = await prisma.calendarActivity.findUnique({
      where: {
        id: calendarActivityId,
        userId,
      }
    });

    if (!calendarActivity) {
      return new Response("Calendar Activity not found", { status: 404 });
    }

    // Create the FullLengthExam record
    const fullLengthExam = await prisma.fullLengthExam.create({
      data: {
        userId,
        title,
        calendarActivityId,
        // Create DataPulses for each section
        dataPulses: {
          create: [
            {
              userId,
              name: "Chemical and Physical Foundations",
              level: "section",
              section: "C/P",
              source: "full_length_exam",
              positive: cp,
              weight: 1,
            },
            {
              userId,
              name: "Critical Analysis and Reasoning",
              level: "section",
              source: "full_length_exam",
              section: "CARs",
              positive: cars,
              weight: 1,
            },
            {
              userId,
              name: "Biological and Biochemical Foundations",
              level: "section",
              source: "full_length_exam",
              section: "B/B",
              positive: bb,
              weight: 1,
            },
            {
              userId,
              name: "Psychological, Social, and Biological Foundations",
              level: "section",
              source: "full_length_exam",
              section: "P/S",
              positive: ps,
              weight: 1,
            }
          ]
        }
      },
      include: {
        dataPulses: true,
        calendarActivity: {
          select: {
            scheduledDate: true,
            status: true,
          }
        }
      }
    });

    // Update calendar activity status in the same transaction
    await prisma.calendarActivity.update({
      where: { id: calendarActivityId },
      data: { 
        status: "Completed",
        fullLengthExam: {
          connect: {
            id: fullLengthExam.id
          }
        }
      }
    });

    return Response.json(fullLengthExam);
  } catch (error) {
    console.error("[FULL_LENGTH_EXAM_COMPLETE]", error);
    return new Response("Internal Error", { status: 500 });
  }
} 