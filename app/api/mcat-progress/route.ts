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
}

interface OnboardingInfo {
  targetScore?: number;
  // add other onboarding fields as needed
}

export async function GET() {
  try {
    console.log("[MCAT_PROGRESS_GET] Starting request");
    const { userId } = auth();
    if (!userId) {
      console.log("[MCAT_PROGRESS_GET] No userId found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log("[MCAT_PROGRESS_GET] UserId:", userId);

    // Get user's target score from onboarding info
    const userInfo = await prisma.userInfo.findUnique({
      where: { userId },
      select: { onboardingInfo: true }
    });
    console.log("[MCAT_PROGRESS_GET] UserInfo:", JSON.stringify(userInfo, null, 2));
    
    // Handle onboardingInfo properly whether it's a string or object
    let onboardingInfo: OnboardingInfo;
    if (typeof userInfo?.onboardingInfo === 'string') {
      console.log("[MCAT_PROGRESS_GET] onboardingInfo is string, parsing...");
      onboardingInfo = JSON.parse(userInfo.onboardingInfo);
    } else {
      console.log("[MCAT_PROGRESS_GET] onboardingInfo is object:", userInfo?.onboardingInfo);
      onboardingInfo = userInfo?.onboardingInfo as OnboardingInfo || {};
    }
    const targetScore = onboardingInfo.targetScore || 520;
    console.log("[MCAT_PROGRESS_GET] Target score:", targetScore);

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
    console.log("[MCAT_PROGRESS_GET] Found exams:", exams.length);

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
    console.log("[MCAT_PROGRESS_GET] Processed chart data:", JSON.stringify(chartData, null, 2));

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
    console.log("[MCAT_PROGRESS_GET] Section averages:", sectionAverages);

    const response = {
      chartData,
      sectionAverages
    } as MCATProgressResponse;
    console.log("[MCAT_PROGRESS_GET] Sending response:", JSON.stringify(response, null, 2));

    return NextResponse.json(response);

  } catch (error) {
    console.error("[MCAT_PROGRESS_GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 