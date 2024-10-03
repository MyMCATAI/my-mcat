import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";
import { calculatePlayerLevel, getPatientsPerDay, getClinicCostPerDay, getLevelNumber } from "@/utils/calculateResourceTotals";


// Called each time the user visits the docts page, designed to update the user's score and patients treated based on their level
export async function POST(req: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userInfo = await prisma.userInfo.findUnique({ where: { userId } });

    if (!userInfo) {
      return new NextResponse(JSON.stringify({ error: "User not found" }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const clinicRooms = JSON.parse(userInfo.clinicRooms);
    
    if (!clinicRooms || clinicRooms.length === 0) {
      return new NextResponse(JSON.stringify({
        error: "No clinic rooms available",
        updatedScore: userInfo.score,
        updatedPatientsTreated: 0,
        patientsPerDay: 0,
        clinicCostPerDay: 0
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let patientRecord = await prisma.patientRecord.findUnique({ where: { userId } });

    // If no patient record is found, create one with zeros
    if (!patientRecord) {
      patientRecord = await prisma.patientRecord.create({
        data: {
          userId,
          patientsTreated: 0,
          lastUpdated: new Date(0) // Set to a past date to ensure it's not considered as "updated today"
        }
      });
    }

    const playerLevel = calculatePlayerLevel(clinicRooms);
    const levelNumber = getLevelNumber(playerLevel);
    const patientsPerDay = getPatientsPerDay(levelNumber);
    const clinicCostPerDay = getClinicCostPerDay(levelNumber);

    // Check if the record was updated today
    if (patientRecord.lastUpdated.toDateString() === new Date().toDateString()) {
      return new NextResponse(JSON.stringify({
        updatedScore: userInfo.score,
        totalPatientsTreated: patientRecord.patientsTreated,
        patientsPerDay,
        clinicCostPerDay,
        alreadyUpdatedToday: true
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if the user has insufficient funds
    if (userInfo.score < clinicCostPerDay) {
      return new NextResponse(JSON.stringify({
        error: "Insufficient funds to run the office today",
        updatedScore: userInfo.score,
        updatedPatientsTreated: 0,
        patientsPerDay,
        clinicCostPerDay
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // If the record was not updated today and user has sufficient funds, then update the score and patients treated
    const updatedScore = userInfo.score - clinicCostPerDay;
    const updatedPatientsTreated = (patientRecord?.patientsTreated || 0) + patientsPerDay;
    const newPatientsTreated = patientsPerDay;

    await prisma.$transaction([
      prisma.userInfo.update({
        where: { userId },
        data: { score: updatedScore }
      }),
      prisma.patientRecord.upsert({
        where: { userId },
        create: {
          userId,
          patientsTreated: newPatientsTreated,
          lastUpdated: new Date()
        },
        update: {
          patientsTreated: updatedPatientsTreated,
          lastUpdated: new Date()
        }
      })
    ]);

    return new NextResponse(JSON.stringify({
      updatedScore,
      newPatientsTreated,
      totalPatientsTreated: updatedPatientsTreated,
      patientsPerDay,
      clinicCostPerDay
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[DOCTORS_OFFICE_POST]', error);
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
