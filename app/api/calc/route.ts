import { NextRequest, NextResponse } from 'next/server';
import { evaluateExpression, EvaluationResult, EvaluationError } from '@/lib/evaluator';

// In-memory history storage (in a real app, use a database)
const calculationHistory: Array<{
  expression: string;
  result: number;
  timestamp: string;
}> = [];

const MAX_HISTORY_SIZE = 50;

/**
 * POST handler for evaluating mathematical expressions
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          error: 'Invalid JSON in request body',
          code: 'INVALID_EXPRESSION',
          details: { error: error instanceof Error ? error.message : String(error) }
        },
        { status: 400 }
      );
    }

    // Validate request body structure
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        {
          error: 'Request body must be a JSON object',
          code: 'INVALID_EXPRESSION'
        },
        { status: 400 }
      );
    }

    const { expression } = body;

    // Check if expression is provided
    if (!expression) {
      return NextResponse.json(
        {
          error: 'Missing required field: expression',
          code: 'INVALID_EXPRESSION'
        },
        { status: 400 }
      );
    }

    // Check if expression is a string
    if (typeof expression !== 'string') {
      return NextResponse.json(
        {
          error: 'Expression must be a string',
          code: 'INVALID_EXPRESSION',
          details: { type: typeof expression }
        },
        { status: 400 }
      );
    }

    // Check if expression is empty
    if (expression.trim().length === 0) {
      return NextResponse.json(
        {
          error: 'Expression cannot be empty',
          code: 'INVALID_EXPRESSION'
        },
        { status: 400 }
      );
    }

    // Evaluate the expression using our safe evaluator
    const evaluation = evaluateExpression(expression);

    // Handle evaluation errors
    if ('code' in evaluation) {
      const errorResponse = evaluation as EvaluationError;
      
      // Determine appropriate status code based on error type
      let statusCode = 500;
      if (errorResponse.code === 'INVALID_EXPRESSION') {
        statusCode = 400;
      } else if (errorResponse.code === 'UNSAFE_EXPRESSION') {
        statusCode = 422;
      }
      
      return NextResponse.json(errorResponse, { status: statusCode });
    }

    // Success case
    const successResult = evaluation as EvaluationResult;
    
    // Add to history
    const historyItem = {
      expression,
      result: successResult.result,
      timestamp: new Date().toISOString()
    };
    
    calculationHistory.unshift(historyItem);
    
    // Keep history size limited
    if (calculationHistory.length > MAX_HISTORY_SIZE) {
      calculationHistory.length = MAX_HISTORY_SIZE;
    }

    // Return successful response
    return NextResponse.json(successResult, { status: 200 });

  } catch (error) {
    // Handle unexpected errors
    console.error('Unexpected error in calculator API:', error);
    
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// Export the history array for use in the history endpoint
export { calculationHistory };