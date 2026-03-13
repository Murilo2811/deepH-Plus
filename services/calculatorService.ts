export function calculateService(operation: string, operands: number[]): number {
  switch (operation) {
    case 'add':
      return operands.reduce((sum, num) => sum + num, 0);
    
    case 'subtract':
      if (operands.length === 1) return -operands[0];
      return operands.reduce((result, num, index) => {
        return index === 0 ? num : result - num;
      });
    
    case 'multiply':
      return operands.reduce((product, num) => product * num, 1);
    
    case 'divide':
      if (operands.length === 1) return 1 / operands[0];
      return operands.reduce((result, num, index) => {
        return index === 0 ? num : result / num;
      });
    
    case 'power':
      if (operands.length === 1) return Math.pow(operands[0], 2);
      return operands.reduce((result, num, index) => {
        return index === 0 ? num : Math.pow(result, num);
      });
    
    case 'sqrt':
      if (operands[0] < 0) {
        throw new Error('Cannot calculate square root of negative number');
      }
      return Math.sqrt(operands[0]);
    
    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }
}