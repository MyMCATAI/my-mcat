// app/api/study-plan/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";
import { z } from 'zod';
import { applyRateLimit } from '@/lib/rate-limiter';
import { handleApiError } from '@/lib/error-handler';

const ROUTE_NAME = 'STUDY_PLAN';

// Define Zod schemas for validation
const fullLengthDaysSchema = z.array(z.string());
const hoursPerDaySchema = z.record(z.string());
const resourcesSchema = z.object({
  hasAAMC: z.boolean().optional(),
  hasUWorld: z.boolean().optional(),
  hasAdaptiveTutoringSuite: z.boolean().optional(),
  hasAnki: z.boolean().optional(),
  hasThirdPartyFLs: z.boolean().optional(),
}).or(z.record(z.boolean()));

const studyPlanPostSchema = z.object({
  examDate: z.string().refine(val => {
    const timestamp = Date.parse(val);
    return !Number.isNaN(timestamp);
  }, {
    message: "Invalid date format"
  }),
  resources: resourcesSchema,
  hoursPerDay: hoursPerDaySchema,
  fullLengthDays: fullLengthDaysSchema,
});

const studyPlanPutSchema = z.object({
  id: z.string().min(1),
  examDate: z.string().refine(val => {
    const timestamp = Date.parse(val);
    return !Number.isNaN(timestamp);
  }, {
    message: "Invalid date format"
  }).optional(),
  resources: resourcesSchema.optional(),
  hoursPerDay: hoursPerDaySchema.optional(),
  fullLengthDays: fullLengthDaysSchema.optional(),
});

export async function GET(req: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await applyRateLimit(req);
    if (rateLimitResult) return rateLimitResult;
    
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studyPlan = await prisma.studyPlan.findFirst({
      where: { userId },
      orderBy: {
        creationDate: 'desc'
      }
    });
    
    return NextResponse.json({ studyPlan });
  } catch (error) {
    // Use secure error handler instead of exposing error details
    return handleApiError(error, ROUTE_NAME, {
      additionalInfo: { method: 'GET' }
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await applyRateLimit(req);
    if (rateLimitResult) return rateLimitResult;
    
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    // Validate request body
    const validationResult = studyPlanPostSchema.safeParse(body);
    
    if (!validationResult.success) {
      // Create a proper ZodError, so error handler can classify correctly
      const validationError = new Error('Invalid input data');
      validationError.name = 'ZodError';
      return handleApiError(validationError, ROUTE_NAME, {
        statusCode: 400,
        additionalInfo: { validationErrors: validationResult.error.format() }
      });
    }
    
    const { examDate, resources, hoursPerDay, fullLengthDays } = validationResult.data;

    const studyPlan = await prisma.studyPlan.create({
      data: {
        userId,
        examDate: new Date(examDate),
        resources,
        hoursPerDay,
        fullLengthDays,
      },
    });

    return NextResponse.json(studyPlan, { status: 201 });
  } catch (error) {
    // Use secure error handler instead of exposing error details
    return handleApiError(error, ROUTE_NAME, {
      additionalInfo: { method: 'POST' }
    });
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await applyRateLimit(req);
    if (rateLimitResult) return rateLimitResult;
    
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    // Validate request body
    const validationResult = studyPlanPutSchema.safeParse(body);
    
    if (!validationResult.success) {
      // Create a proper ZodError, so error handler can classify correctly
      const validationError = new Error('Invalid input data');
      validationError.name = 'ZodError';
      return handleApiError(validationError, ROUTE_NAME, {
        statusCode: 400, 
        additionalInfo: { validationErrors: validationResult.error.format() }
      });
    }
    
    const { id, examDate, resources, hoursPerDay, fullLengthDays } = validationResult.data;

    const updatedStudyPlan = await prisma.studyPlan.update({
      where: { id, userId },
      data: {
        examDate: examDate ? new Date(examDate) : undefined,
        resources,
        hoursPerDay,
        fullLengthDays,
      },
    });

    return NextResponse.json(updatedStudyPlan);
  } catch (error) {
    // Use secure error handler instead of exposing error details
    return handleApiError(error, ROUTE_NAME, {
      additionalInfo: { method: 'PUT' }
    });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Apply rate limiting with more strict limits for destructive operations
    const rateLimitResult = await applyRateLimit(req, 'sensitiveData');
    if (rateLimitResult) return rateLimitResult;
    
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const studyPlanId = searchParams.get('id');

    if (!studyPlanId) {
      return NextResponse.json({ error: "Study plan ID is required" }, { status: 400 });
    }

    await prisma.studyPlan.delete({
      where: { id: studyPlanId, userId },
    });

    return NextResponse.json({ message: "Study plan deleted successfully" });
  } catch (error) {
    // Use secure error handler instead of exposing error details
    return handleApiError(error, ROUTE_NAME, {
      additionalInfo: { method: 'DELETE' }
    });
  }
}