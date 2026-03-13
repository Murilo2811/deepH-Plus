import { NextRequest, NextResponse } from 'next/server';
import { evaluateExpression } from '@/lib/evaluator';

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

    // Validate expression length
    if (expression.length > 100) {
      return NextResponse.json(
        { error: 'Expression too long' },
        { status: 400 }
      );
    }

    const result = evaluateExpression(expression);
    
    // Store in history (in-memory for demo, would be database in production)
    const historyEntry = {
      expression,
      result,
      timestamp: new Date().toISOString(),
    };

    // Add to history (global variable for demo purposes)
    if (!global.calcHistory) {
      global.calcHistory = [];
    }
    global.calcHistory.unshift(historyEntry);
    
    // Keep only last 50 entries
    if (global.calcHistory.length > 50) {
      global.calcHistory = global.calcHistory.slice(0, 50);
    }

    return NextResponse.json({
      expression,
      result,
      timestamp: historyEntry.timestamp,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Invalid expression' },
      { status: 400 }
    );
  }
}