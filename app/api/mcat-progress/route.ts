export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";

export interface MCATProgressResponse {
  chartData: {
    labels: string[];
    scores: number[];
    targetScore: number;
  };
  sectionAverages: {
    "CARs": number | null;
    "Psych/Soc": number | null;
    "Chem/Phys": number | null;
    "Bio/Biochem": number | null;
  };
  diagnosticScores?: {
    total: string;
    cp: string;
    cars: string;
    bb: string;
    ps: string;
  } | null;
}

interface OnboardingInfo {
  targetScore?: number;
  // add other onboarding fields as needed
}

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's target score from onboarding info and diagnostic scores
    const userInfo = await prisma.userInfo.findUnique({
      where: { userId },
      select: { 
        onboardingInfo: true,
        diagnosticScores: true
      }
    });
    
    console.log("DEBUG - MCAT Progress API - User ID:", userId);
    console.log("DEBUG - MCAT Progress API - User info retrieved:", !!userInfo);
    console.log("DEBUG - MCAT Progress API - Diagnostic scores:", JSON.stringify(userInfo?.diagnosticScores, null, 2));
    
    // Handle onboardingInfo properly whether it's a string or object
    let onboardingInfo: OnboardingInfo;
    if (typeof userInfo?.onboardingInfo === 'string') {
      onboardingInfo = JSON.parse(userInfo.onboardingInfo);
    } else {
      onboardingInfo = userInfo?.onboardingInfo as OnboardingInfo || {};
    }
    const targetScore = onboardingInfo.targetScore || 520;
    // Get all exams with their scores
    const exams = await prisma.fullLengthExam.findMany({
      where: { userId },
      select: {
        dataPulses: {
          select: {
            name: true,
            positive: true,
          }
        },
        calendarActivity: {
          select: {
            scheduledDate: true,
          }
        }
      },
      orderBy: {
        calendarActivity: {
          scheduledDate: 'asc'
        }
      }
    });

    // Process exam data for chart
    const chartData = {
      labels: [] as string[],
      scores: [] as number[],
      targetScore
    };

    // Process section scores
    const sectionScores = {
      "CARs": [] as number[],
      "Psych/Soc": [] as number[],
      "Chem/Phys": [] as number[],
      "Bio/Biochem": [] as number[]
    };

    // Calculate scores and organize by section
    exams.forEach(exam => {
      if (exam.calendarActivity?.scheduledDate) {
        const date = new Date(exam.calendarActivity.scheduledDate);
        chartData.labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        
        const totalScore = exam.dataPulses.reduce((sum, pulse) => sum + pulse.positive, 0);
        chartData.scores.push(totalScore);

        // Add to section scores
        exam.dataPulses.forEach(pulse => {
          if (pulse.name.includes("Critical Analysis")) {
            sectionScores["CARs"].push(pulse.positive);
          } else if (pulse.name.includes("Psychological")) {
            sectionScores["Psych/Soc"].push(pulse.positive);
          } else if (pulse.name.includes("Chemical")) {
            sectionScores["Chem/Phys"].push(pulse.positive);
          } else if (pulse.name.includes("Biological")) {
            sectionScores["Bio/Biochem"].push(pulse.positive);
          }
        });
      }
    });

    // Calculate section averages
    const sectionAverages: MCATProgressResponse['sectionAverages'] = {
      "CARs": sectionScores["CARs"].length > 0 
        ? Math.round(sectionScores["CARs"].reduce((a, b) => a + b, 0) / sectionScores["CARs"].length)
        : null,
      "Psych/Soc": sectionScores["Psych/Soc"].length > 0
        ? Math.round(sectionScores["Psych/Soc"].reduce((a, b) => a + b, 0) / sectionScores["Psych/Soc"].length)
        : null,
      "Chem/Phys": sectionScores["Chem/Phys"].length > 0
        ? Math.round(sectionScores["Chem/Phys"].reduce((a, b) => a + b, 0) / sectionScores["Chem/Phys"].length)
        : null,
      "Bio/Biochem": sectionScores["Bio/Biochem"].length > 0
        ? Math.round(sectionScores["Bio/Biochem"].reduce((a, b) => a + b, 0) / sectionScores["Bio/Biochem"].length)
        : null
    };

    // Extract diagnostic scores from user info
    const diagnosticScores = userInfo?.diagnosticScores as {
      total: string;
      cp: string;
      cars: string;
      bb: string;
      ps: string;
    } | null;
    
    console.log("Diagnostic scores from DB:", diagnosticScores);

    const response = {
      chartData,
      sectionAverages,
      diagnosticScores
    } as MCATProgressResponse;

    return NextResponse.json(response);

  } catch (error) {
    console.error("[MCAT_PROGRESS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 