/**
 * Safe mathematical expression evaluator
 * Uses Function constructor with strict allowlist to prevent arbitrary code execution
 */

export interface EvaluationResult {
  result: number;
  error?: string;
}

/**
 * Validates and evaluates a mathematical expression safely
 * @param expression - Mathematical expression string
 * @returns EvaluationResult with result or error
 */
export function evaluateExpression(expression: string): EvaluationResult {
  try {
    // 1. Basic input validation
    if (!expression || typeof expression !== 'string') {
      return { result: 0, error: 'Expression must be a non-empty string' };
    }

    // 2. Length check
    if (expression.length > 100) {
      return { result: 0, error: 'Expression too long (max 100 characters)' };
    }

    // 3. Character allowlist validation
    // Only allow: digits, spaces, basic operators, parentheses, decimal point
    const allowedChars = /^[0-9\s+\-*/()\.]+$/;
    if (!allowedChars.test(expression)) {
      return { result: 0, error: 'Expression contains invalid characters. Only numbers, +, -, *, /, (, ), and . are allowed' };
    }

    // 4. Basic syntax validation
    // Check for balanced parentheses
    let balance = 0;
    for (const char of expression) {
      if (char === '(') balance++;
      if (char === ')') balance--;
      if (balance < 0) {
        return { result: 0, error: 'Unbalanced parentheses' };
      }
    }
    if (balance !== 0) {
      return { result: 0, error: 'Unbalanced parentheses' };
    }

    // 5. Check for consecutive operators or other suspicious patterns
    const suspiciousPatterns = [
      /\.\./, // double decimal
      /\/\s*0(?!\.)/, // division by zero (integer)
      /\/\s*0\.0*/, // division by zero (decimal)
      /[+\-*/]{2,}/, // consecutive operators
      /\(\)/, // empty parentheses
      /[+\-*/]\s*[+\-*/]/ // operators with only whitespace between
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(expression)) {
        if (pattern.toString().includes('0')) {
          return { result: 0, error: 'Division by zero is not allowed' };
        }
        return { result: 0, error: 'Invalid expression syntax' };
      }
    }

    // 6. Safe evaluation using Function constructor
    // Create a sandboxed function that only has access to Math object
    const safeEval = new Function('Math', `"use strict"; return (${expression});`);
    
    // Execute with only Math object available
    const result = safeEval(Math);
    
    // 7. Validate result is a finite number
    if (typeof result !== 'number' || !isFinite(result)) {
      return { result: 0, error: 'Expression does not evaluate to a finite number' };
    }

    // 8. Handle floating point precision issues
    const roundedResult = Math.round(result * 1e12) / 1e12;

    return { result: roundedResult };
  } catch (error) {
    // Catch any runtime errors during evaluation
    if (error instanceof Error) {
      return { result: 0, error: `Evaluation error: ${error.message}` };
    }
    return { result: 0, error: 'Unknown evaluation error' };
  }
}

/**
 * Helper function to validate expression format
 * @param expression - Expression to validate
 * @returns Validation result with error message if invalid
 */
export function validateExpression(expression: string): { valid: boolean; error?: string } {
  const result = evaluateExpression(expression);
  if (result.error) {
    return { valid: false, error: result.error };
  }
  return { valid: true };
}