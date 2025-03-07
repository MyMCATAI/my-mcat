export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";
import { calculatePlayerLevel, getPatientsPerDay, getClinicCostPerDay, getLevelNumber } from "@/utils/calculateResourceTotals";

// Called each time the user visits the docts page, designed to update patients treated based on their level
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

    let clinicRooms = [];
    if (userInfo.clinicRooms) {
      try {
        clinicRooms = JSON.parse(userInfo.clinicRooms);
      } catch (error) {
        console.error('Error parsing clinicRooms:', error);
      }
    }
    
    if (clinicRooms.length === 0) {
      return new NextResponse(JSON.stringify({
        message: "To start treating patients, you need to buy your first clinic room.",
        updatedScore: userInfo.score,
        newPatientsTreated: 0,
        totalPatientsTreated: 0,
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

    // Check if the record was updated today
    if (patientRecord.lastUpdated.toDateString() === new Date().toDateString()) {
      return new NextResponse(JSON.stringify({
        updatedScore: userInfo.score,
        totalPatientsTreated: patientRecord.patientsTreated,
        patientsPerDay,
        alreadyUpdatedToday: true
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update patients treated (no coin cost)
    const updatedPatientsTreated = (patientRecord?.patientsTreated || 0) + patientsPerDay;
    const newPatientsTreated = patientsPerDay;

    await prisma.patientRecord.upsert({
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
    });

    return new NextResponse(JSON.stringify({
      updatedScore: userInfo.score,
      newPatientsTreated,
      totalPatientsTreated: updatedPatientsTreated,
      patientsPerDay
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
