import { NextRequest, NextResponse } from 'next/server';
import { evaluateExpression } from '@/lib/evaluator';
import { addToHistory } from './history/route';

/**
 * POST handler for evaluating mathematical expressions
 * @param request - Next.js request object
 * @returns JSON response with result or error
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // 2. Validate request structure
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Request body must be a JSON object' },
        { status: 400 }
      );
    }

    const { expression } = body;

    // 3. Validate expression field
    if (typeof expression !== 'string') {
      return NextResponse.json(
        { error: 'Expression must be a string' },
        { status: 400 }
      );
    }

    if (!expression.trim()) {
      return NextResponse.json(
        { error: 'Expression cannot be empty' },
        { status: 400 }
      );
    }

    // 4. Evaluate the expression safely
    const evaluation = evaluateExpression(expression.trim());

    // 5. Handle evaluation errors
    if (evaluation.error) {
      // Determine appropriate status code based on error type
      const statusCode = evaluation.error.includes('invalid characters') ||
                        evaluation.error.includes('Unbalanced parentheses') ||
                        evaluation.error.includes('Invalid expression syntax') ||
                        evaluation.error.includes('Expression too long')
        ? 400 // Bad Request for syntax errors
        : 422; // Unprocessable Entity for evaluation errors

      return NextResponse.json(
        { error: evaluation.error },
        { status: statusCode }
      );
    }

    // 6. Store successful calculation in history
    addToHistory(expression.trim(), evaluation.result);

    // 7. Return successful response
    return NextResponse.json(
      { result: evaluation.result },
      { status: 200 }
    );

  } catch (error) {
    // Handle unexpected errors
    console.error('Unexpected error in calculator API:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET handler (optional - not in OpenAPI contract but useful for testing)
 * Returns API information
 */
export async function GET() {
  return NextResponse.json({
    message: 'Calculator API',
    endpoints: {
      POST: '/api/calc - Evaluate mathematical expression',
      GET: '/api/calc/history - Get calculation history'
    },
    usage: {
      POST: 'Send JSON with { "expression": "2 + 3 * 4" }',
      allowed_characters: 'Numbers, +, -, *, /, (, ), ., and spaces'
    }
  });
}