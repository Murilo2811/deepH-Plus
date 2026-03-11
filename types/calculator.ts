export type OperationType = 'add' | 'subtract' | 'multiply' | 'divide' | 'power' | 'sqrt';

export interface CalculatorOperation {
  value1: number;
  value2?: number;
  operation: OperationType;
}

export interface CalculationResult {
  id: string;
  value1: number;
  value2?: number;
  operation: OperationType;
  result: number;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalculationHistory extends CalculationResult {}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CalculateResponse {
  result: number;
  operation: string;
  calculationId: string;
}

export interface HistoryResponse {
  calculations: CalculationHistory[];
  total: number;
  page: number;
  limit: number;
}