import { NextRequest, NextResponse } from 'next/server';
import { calculationHistory } from '../route';

/**
 * GET handler for retrieving calculation history
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters for pagination/filtering (optional)
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    // Parse limit parameter with validation
    let parsedLimit = 50; // Default limit
    if (limit) {
      const limitNum = parseInt(limit, 10);
      if (!isNaN(limitNum) && limitNum > 0 && limitNum <= 100) {
        parsedLimit = limitNum;
      } else {
        return NextResponse.json(
          {
            error: 'Invalid limit parameter. Must be a number between 1 and 100.',
            code: 'INVALID_PARAMETER',
            details: { limit }
          },
          { status: 400 }
        );
      }
    }

    // Parse offset parameter with validation
    let parsedOffset = 0; // Default offset
    if (offset) {
      const offsetNum = parseInt(offset, 10);
      if (!isNaN(offsetNum) && offsetNum >= 0) {
        parsedOffset = offsetNum;
      } else {
        return NextResponse.json(
          {
            error: 'Invalid offset parameter. Must be a non-negative number.',
            code: 'INVALID_PARAMETER',
            details: { offset }
          },
          { status: 400 }
        );
      }
    }

    // Apply pagination
    const paginatedHistory = calculationHistory.slice(
      parsedOffset,
      parsedOffset + parsedLimit
    );

    // Return history with metadata
    return NextResponse.json(
      {
        data: paginatedHistory,
        metadata: {
          total: calculationHistory.length,
          limit: parsedLimit,
          offset: parsedOffset,
          hasMore: parsedOffset + parsedLimit < calculationHistory.length,
          timestamp: new Date().toISOString()
        }
      },
      { status: 200 }
    );

  } catch (error) {
    // Handle unexpected errors
    console.error('Unexpected error in history API:', error);
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        details: {
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}