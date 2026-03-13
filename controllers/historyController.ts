import { getHistory, clearHistory } from '@/services/historyService';
import { CalculationResult } from '@/types/calculator';

export async function getHistoryController(
  userId: string,
  limit: number = 10
): Promise<{ history: CalculationResult[] }> {
  try {
    const history = await getHistory(userId, limit);
    
    return {
      history
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to retrieve history');
  }
}

export async function clearHistoryController(
  userId: string
): Promise<{ message: string }> {
  try {
    await clearHistory(userId);
    
    return {
      message: 'History cleared successfully'
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to clear history');
  }
}