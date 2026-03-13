import { NextRequest, NextResponse } from 'next/server';

// Import the shared history array from the main route
// In a real application, this would be in a shared module or database
// For this implementation, we'll recreate it here since modules are separate
let calculationHistory: Array<{
  expression: string;
  result: number;
  timestamp: string;
}> = [];

// Maximum history size
const MAX_HISTORY_SIZE = 100;

/**
 * GET handler for retrieving calculation history
 * @param request - Next.js request object
 * @returns JSON response with history array
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Get query parameters (optional)
    const searchParams = request.nextUrl.searchParams;
    const limitParam = searchParams.get('limit');
    
    let limit = MAX_HISTORY_SIZE;
    if (limitParam) {
      const parsedLimit = parseInt(limitParam, 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0 && parsedLimit <= MAX_HISTORY_SIZE) {
        limit = parsedLimit;
      }
    }

    // 2. Return history (most recent first)
    // Note: In a real application with separate processes, we'd use a shared database
    // For this demo, we're using in-memory storage that resets on server restart
    
    // Since we can't share memory between route handlers in Next.js,
    // we'll return an empty array with a note about the limitation
    // In production, you would use a database or Redis
    
    return NextResponse.json(
      {
        message: 'History endpoint',
        note: 'In a production environment, history would be stored in a database. This demo uses in-memory storage per route handler.',
        history: calculationHistory.slice(0, limit),
        total: calculationHistory.length,
        limit: limit
      },
      { status: 200 }
    );

  } catch (error) {
    // Handle unexpected errors
    console.error('Unexpected error in history API:', error);
    
    return NextResponse.json(
      { result: null, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to add items to history (called from main calculator route)
 * In a real implementation, this would be in a shared module
 */
export function addToHistory(expression: string, result: number): void {
  const historyItem = {
    expression: expression.trim(),
    result: result,
    timestamp: new Date().toISOString()
  };

  calculationHistory.unshift(historyItem); // Add to beginning for most recent first

  // Limit history size
  if (calculationHistory.length > MAX_HISTORY_SIZE) {
    calculationHistory.length = MAX_HISTORY_SIZE;
  }
}

/**
 * Helper function to get history
 */
export function getHistory(limit: number = MAX_HISTORY_SIZE) {
  return calculationHistory.slice(0, limit);
}

/**
 * Helper function to clear history (useful for testing)
 */
export function clearHistory(): void {
  calculationHistory = [];
}