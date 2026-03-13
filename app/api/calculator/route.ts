import { NextRequest, NextResponse } from 'next/server';
import { calculateController } from '@/controllers/calculatorController';
import { CalculationRequest } from '@/types/calculator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    if (!body.operation || !body.operands || !Array.isArray(body.operands)) {
      return NextResponse.json(
        { error: 'Invalid request body. Required fields: operation, operands' },
        { status: 400 }
      );
    }

    const calculationRequest: CalculationRequest = {
      operation: body.operation,
      operands: body.operands,
      userId: body.userId || 'anonymous'
    };

    const result = await calculateController(calculationRequest);
    
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Calculator API error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const operation = searchParams.get('operation');
    const operandsParam = searchParams.get('operands');
    
    if (!operation || !operandsParam) {
      return NextResponse.json(
        { error: 'Missing required query parameters: operation, operands' },
        { status: 400 }
      );
    }

    const operands = operandsParam.split(',').map(Number);
    
    const calculationRequest: CalculationRequest = {
      operation,
      operands,
      userId: searchParams.get('userId') || 'anonymous'
    };

    const result = await calculateController(calculationRequest);
    
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Calculator API error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}