/**
 * Safe mathematical expression evaluator
 * Uses Function constructor with strict allowlist to prevent arbitrary code execution
 */

export interface EvaluationResult {
  result: number;
  error?: string;
}

export interface EvaluationError {
  error: string;
  code: 'INVALID_EXPRESSION' | 'UNSAFE_EXPRESSION' | 'INTERNAL_ERROR';
  details?: Record<string, unknown>;
}

// Allowed characters and patterns
const ALLOWED_CHARS = /^[0-9\s+\-*/()\.]+$/;
const MAX_EXPRESSION_LENGTH = 1000;

// Additional safety checks for dangerous patterns
const DANGEROUS_PATTERNS = [
  /Function\(/i,
  /eval\(/i,
  /setTimeout\(/i,
  /setInterval\(/i,
  /new Function\(/i,
  /constructor\(/i,
  /prototype/i,
  /__proto__/i,
  /process\./i,
  /require\(/i,
  /import\(/i,
  /window\./i,
  /document\./i,
  /alert\(/i,
  /console\./i,
  /localStorage/i,
  /sessionStorage/i,
];

/**
 * Validate and sanitize expression input
 */
function validateExpression(expression: string): { valid: boolean; error?: EvaluationError } {
  // Check length
  if (expression.length > MAX_EXPRESSION_LENGTH) {
    return {
      valid: false,
      error: {
        error: `Expression too long (max ${MAX_EXPRESSION_LENGTH} characters)`,
        code: 'INVALID_EXPRESSION',
        details: { length: expression.length, maxLength: MAX_EXPRESSION_LENGTH }
      }
    };
  }

  // Check allowed characters
  if (!ALLOWED_CHARS.test(expression)) {
    return {
      valid: false,
      error: {
        error: 'Expression contains invalid characters. Only numbers, +, -, *, /, (, ), ., and spaces are allowed.',
        code: 'INVALID_EXPRESSION',
        details: { expression: expression }
      }
    };
  }

  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(expression)) {
      return {
        valid: false,
        error: {
          error: 'Expression contains potentially unsafe patterns',
          code: 'UNSAFE_EXPRESSION',
          details: { pattern: pattern.toString(), expression: expression }
        }
      };
    }
  }

  // Additional safety: ensure expression has at least one number
  if (!/\d/.test(expression)) {
    return {
      valid: false,
      error: {
        error: 'Expression must contain at least one number',
        code: 'INVALID_EXPRESSION',
        details: { expression: expression }
      }
    };
  }

  // Check for balanced parentheses
  let balance = 0;
  for (const char of expression) {
    if (char === '(') balance++;
    if (char === ')') balance--;
    if (balance < 0) {
      return {
        valid: false,
        error: {
          error: 'Unbalanced parentheses',
          code: 'INVALID_EXPRESSION',
          details: { expression: expression }
        }
      };
    }
  }
  if (balance !== 0) {
    return {
      valid: false,
      error: {
        error: 'Unbalanced parentheses',
        code: 'INVALID_EXPRESSION',
        details: { expression: expression }
      }
    };
  }

  return { valid: true };
}

/**
 * Safely evaluate a mathematical expression
 * Uses Function constructor with strict scope isolation
 */
export function evaluateExpression(expression: string): EvaluationResult | EvaluationError {
  try {
    // Validate input
    const validation = validateExpression(expression);
    if (!validation.valid) {
      return validation.error!;
    }

    // Clean up expression: remove extra spaces
    const cleanExpr = expression.replace(/\s+/g, ' ').trim();

    // Create a safe evaluation function
    // Using Function constructor with limited scope
    const safeEval = new Function('expr', `
      try {
        // Only allow mathematical operations
        const result = eval(expr);
        
        // Ensure result is a finite number
        if (typeof result !== 'number' || !isFinite(result)) {
          throw new Error('Invalid result');
        }
        
        return result;
      } catch (error) {
        throw new Error('Evaluation failed: ' + error.message);
      }
    `);

    // Execute with try-catch
    const result = safeEval(cleanExpr);
    
    // Additional validation of result
    if (typeof result !== 'number' || !isFinite(result)) {
      return {
        error: 'Invalid calculation result',
        code: 'INVALID_EXPRESSION',
        details: { result: result, expression: expression }
      };
    }

    // Handle division by zero gracefully
    if (Math.abs(result) === Infinity) {
      return {
        result: result,
        error: 'Division by zero handled as Infinity'
      };
    }

    return { result: result };

  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown evaluation error',
      code: 'INTERNAL_ERROR',
      details: { 
        expression: expression,
        error: error instanceof Error ? error.toString() : String(error)
      }
    };
  }
}

/**
 * Format expression for display (optional helper)
 */
export function formatExpression(expression: string): string {
  return expression
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\*/g, '×')
    .replace(/\//g, '÷');
}