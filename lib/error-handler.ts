import { NextResponse } from 'next/server';

type ErrorDetail = {
  code: string;
  message: string;
};

type ErrorOptions = {
  statusCode?: number;
  errorId?: string;
  logError?: boolean;
  logFull?: boolean;
  includeDetails?: boolean;
  additionalInfo?: Record<string, unknown>;
};

/**
 * A secure error handler for API routes that avoids leaking sensitive information
 * 
 * @param error The original error
 * @param routeName Name of the API route for logging 
 * @param options Error handling options
 * @returns NextResponse with sanitized error information
 */
export function handleApiError(
  error: unknown,
  routeName: string,
  options: ErrorOptions = {}
): NextResponse {
  const {
    statusCode = 500,
    errorId = generateErrorId(),
    logError = true,
    logFull = process.env.NODE_ENV === 'development',
    includeDetails = process.env.NODE_ENV === 'development',
    additionalInfo = {}
  } = options;

  // Basic details we can safely expose even in production
  const errorDetails: ErrorDetail = {
    code: 'internal_error',
    message: 'An unexpected error occurred'
  };

  // Extract error information without exposing sensitive details
  if (error instanceof Error) {
    if (error.name === 'ValidationError' || error.name === 'ZodError') {
      errorDetails.code = 'validation_error';
      errorDetails.message = 'Invalid input data';
      // We can be more specific with validation errors
      if (includeDetails) {
        additionalInfo.validationDetails = error.message;
      }
    } else if (error.name === 'PrismaClientKnownRequestError') {
      errorDetails.code = 'database_error';
      errorDetails.message = 'Database operation failed';
    } else if (error.name === 'UnauthorizedError') {
      errorDetails.code = 'unauthorized';
      errorDetails.message = 'Unauthorized access';
      // Override status code for auth errors
      options.statusCode = 401;
    } else if (error.message.includes('not found')) {
      errorDetails.code = 'not_found';
      errorDetails.message = 'Resource not found';
      options.statusCode = 404;
    }
  }

  // For client-visible error logging (non-sensitive)
  const clientErrorResponse = {
    error: errorDetails.message,
    code: errorDetails.code,
    errorId,
    ...(includeDetails && error instanceof Error ? { details: error.message } : {})
  };

  // For server logs (potentially sensitive, but needed for debugging)
  if (logError) {
    const context = {
      errorId,
      route: routeName,
      ...additionalInfo
    };
    
    if (logFull && error instanceof Error) {
      console.error(`[${routeName}] Error:`, {
        ...context,
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    } else {
      // Log without sensitive stack traces
      console.error(`[${routeName}] Error (${errorId}):`, errorDetails.message);
    }
  }

  return NextResponse.json(clientErrorResponse, { status: statusCode });
}

/**
 * Generate a unique error ID to help correlate client errors with server logs
 */
function generateErrorId(): string {
  return Math.random().toString(36).substring(2, 10);
} 