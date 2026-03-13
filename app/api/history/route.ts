import { NextRequest, NextResponse } from 'next/server';
import { getHistoryController, clearHistoryController } from '@/controllers/historyController';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'anonymous';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
    
    const history = await getHistoryController(userId, limit);
    
    return NextResponse.json(history, { status: 200 });
  } catch (error) {
    console.error('History API error:', error);
    
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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'anonymous';
    
    const result = await clearHistoryController(userId);
    
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('History API error:', error);
    
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