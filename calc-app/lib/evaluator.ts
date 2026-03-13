export function evaluate(expression: string): number {
  // Remove whitespace
  const cleanExpr = expression.replace(/\s+/g, '');
  
  if (!cleanExpr) {
    throw new Error('Empty expression');
  }

  // Validate expression contains only allowed characters
  const allowedChars = /^[0-9+\-*/().\s]+$/;
  if (!allowedChars.test(cleanExpr)) {
    throw new Error('Expression contains invalid characters');
  }

  // Check for balanced parentheses
  let balance = 0;
  for (const char of cleanExpr) {
    if (char === '(') balance++;
    if (char === ')') balance--;
    if (balance < 0) {
      throw new Error('Unbalanced parentheses');
    }
  }
  if (balance !== 0) {
    throw new Error('Unbalanced parentheses');
  }

  // Check for consecutive operators
  const operatorPattern = /[+\-*/]{2,}/;
  if (operatorPattern.test(cleanExpr)) {
    throw new Error('Consecutive operators are not allowed');
  }

  // Check for division by zero
  if (cleanExpr.includes('/0') && !cleanExpr.includes('/0.')) {
    throw new Error('Division by zero');
  }

  // Safe evaluation using Function constructor
  // Note: In production, consider using a proper math parser library
  try {
    // Create a safe evaluation context
    const result = Function(`"use strict"; return (${cleanExpr})`)();
    
    if (typeof result !== 'number' || !isFinite(result)) {
      throw new Error('Invalid result');
    }
    
    // Round to avoid floating point precision issues
    return Math.round(result * 1000000) / 1000000;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Invalid expression: ${error.message}`);
    }
    throw new Error('Invalid expression');
  }
}