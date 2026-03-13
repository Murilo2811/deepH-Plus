import { CalculationRequest, CalculationResult } from '@/types/calculator';
import { calculateService } from '@/services/calculatorService';
import { addToHistory } from '@/services/historyService';

export async function calculateController(
  request: CalculationRequest
): Promise<CalculationResult> {
  try {
    // Validate operation
    const validOperations = ['add', 'subtract', 'multiply', 'divide', 'power', 'sqrt'];
    if (!validOperations.includes(request.operation)) {
      throw new Error(`Invalid operation. Valid operations are: ${validOperations.join(', ')}`);
    }

    // Validate operands
    if (!request.operands || request.operands.length === 0) {
      throw new Error('At least one operand is required');
    }

    // Special validation for sqrt operation
    if (request.operation === 'sqrt' && request.operands.length !== 1) {
      throw new Error('Square root operation requires exactly one operand');
    }

    // Validate for division by zero
    if (request.operation === 'divide' && request.operands[1] === 0) {
      throw new Error('Division by zero is not allowed');
    }

    // Perform calculation
    const result = calculateService(request.operation, request.operands);
    
    // Create calculation result
    const calculationResult: CalculationResult = {
      operation: request.operation,
      operands: request.operands,
      result,
      timestamp: new Date().toISOString(),
      userId: request.userId
    };

    // Store in history
    await addToHistory(calculationResult);

    return calculationResult;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Calculation failed');
  }
}