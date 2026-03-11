import { CalculatorOperation, CalculationHistory, CalculateResponse, ApiResponse } from '@/types/calculator';

const API_BASE_URL = '/api';

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data: ApiResponse<T> = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || data.message || 'API request failed');
    }

    return data.data as T;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
}

export async function calculate(operation: CalculatorOperation): Promise<CalculateResponse> {
  return apiRequest<CalculateResponse>('/calculate', {
    method: 'POST',
    body: JSON.stringify(operation),
  });
}

export async function getHistory(): Promise<CalculationHistory[]> {
  const response = await apiRequest<{ calculations: CalculationHistory[] }>('/history');
  return response.calculations || [];
}

export async function getHistoryById(id: string): Promise<CalculationHistory> {
  return apiRequest<CalculationHistory>(`/history/${id}`);
}

export async function deleteHistory(id: string): Promise<void> {
  await apiRequest(`/history/${id}`, {
    method: 'DELETE',
  });
}

export async function clearHistory(): Promise<void> {
  await apiRequest('/history/clear', {
    method: 'DELETE',
  });
}

export async function getStats(): Promise<{
  totalCalculations: number;
  successfulCalculations: number;
  failedCalculations: number;
  mostUsedOperation: string;
}> {
  return apiRequest('/stats');
}

// Utility function for real-time updates (WebSocket/SSE would be better)
export async function subscribeToUpdates(callback: (update: CalculationHistory) => void) {
  // This is a placeholder for real-time updates
  // In a real app, you would use WebSocket or Server-Sent Events
  console.log('Real-time updates not implemented');
}