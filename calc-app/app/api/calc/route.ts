import { NextRequest, NextResponse } from 'next/server';
import { evaluate } from '@/lib/evaluator';
import { getHistory, addToHistory } from '@/lib/history';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { expression } = body;

    if (!expression || typeof expression !== 'string') {
      return NextResponse.json(
        { error: 'Expression is required and must be a string' },
        { status: 400 }
      );
    }

    // Evaluate the expression
    const result = evaluate(expression);
    
    // Add to history
    const historyEntry = {
      expression,
      result,
      timestamp: new Date().toISOString()
    };
    addToHistory(historyEntry);

    return NextResponse.json({ result });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Invalid expression' },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Use POST method with { "expression": "your expression" }' },
    { status: 200 }
  );
}