import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Initialize history if not exists
    if (!global.calcHistory) {
      global.calcHistory = [];
    }

    // Return history (limited to last 20 entries for performance)
    const history = global.calcHistory.slice(0, 20);
    
    return NextResponse.json({
      history,
      count: history.length,
      total: global.calcHistory.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}