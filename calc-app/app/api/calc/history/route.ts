import { NextResponse } from 'next/server';
import { getHistory } from '@/lib/history';

export async function GET() {
  try {
    const history = getHistory();
    return NextResponse.json({ history });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve history' },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { message: 'Use GET method to retrieve calculation history' },
    { status: 405 }
  );
}