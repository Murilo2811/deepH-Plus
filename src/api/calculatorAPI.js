// Calculator API Client
// This module handles all API calls to the calculator backend

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Mock data for demonstration purposes
const mockHistory = [
  { id: '1', operation: 'add', num1: 10, num2: 5, result: 15, timestamp: '2024-01-15T10:30:00Z' },
  { id: '2', operation: 'subtract', num1: 20, num2: 7, result: 13, timestamp: '2024-01-15T11:15:00Z' },
  { id: '3', operation: 'multiply', num1: 6, num2: 8, result: 48, timestamp: '2024-01-15T12:00:00Z' },
  { id: '4', operation: 'divide', num1: 100, num2: 4, result: 25, timestamp: '2024-01-15T13:45:00Z' },
  { id: '5', operation: 'power', num1: 2, num2: 8, result: 256, timestamp: '2024-01-15T14:20:00Z' },
  { id: '6', operation: 'sqrt', num1: 64, num2: null, result: 8, timestamp: '2024-01-15T15:10:00Z' },
];

class CalculatorAPI {
  // Simulate API delay
  static async simulateDelay(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get calculation history
  static async getHistory() {
    await this.simulateDelay();
    
    // In a real app, this would be:
    // const response = await fetch(`${API_BASE_URL}/calculations`);
    // if (!response.ok) throw new Error('Failed to fetch history');
    // return await response.json();
    
    return [...mockHistory];
  }

  // Perform a calculation
  static async calculate(operation, num1, num2 = null) {
    await this.simulateDelay();
    
    // Validate inputs
    if (typeof num1 !== 'number' || isNaN(num1)) {
      throw new Error('First number must be a valid number');
    }

    if (operation !== 'sqrt' && (typeof num2 !== 'number' || isNaN(num2))) {
      throw new Error('Second number must be a valid number');
    }

    let result;
    
    switch (operation) {
      case 'add':
        result = num1 + num2;
        break;
      case 'subtract':
        result = num1 - num2;
        break;
      case 'multiply':
        result = num1 * num2;
        break;
      case 'divide':
        if (num2 === 0) {
          throw new Error('Cannot divide by zero');
        }
        result = num1 / num2;
        break;
      case 'power':
        result = Math.pow(num1, num2);
        break;
      case 'sqrt':
        if (num1 < 0) {
          throw new Error('Cannot calculate square root of negative number');
        }
        result = Math.sqrt(num1);
        break;
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }

    // Round to 6 decimal places to avoid floating point precision issues
    result = Math.round(result * 1000000) / 1000000;

    // Create new calculation record
    const newCalculation = {
      id: Date.now().toString(),
      operation,
      num1,
      num2,
      result,
      timestamp: new Date().toISOString()
    };

    // In a real app, this would be:
    // const response = await fetch(`${API_BASE_URL}/calculations`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(newCalculation)
    // });
    // if (!response.ok) throw new Error('Failed to save calculation');
    // return await response.json();
    
    mockHistory.unshift(newCalculation);
    return newCalculation;
  }

  // Delete a calculation
  static async deleteCalculation(id) {
    await this.simulateDelay();
    
    // In a real app, this would be:
    // const response = await fetch(`${API_BASE_URL}/calculations/${id}`, {
    //   method: 'DELETE'
    // });
    // if (!response.ok) throw new Error('Failed to delete calculation');
    // return await response.json();
    
    const index = mockHistory.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error('Calculation not found');
    }
    
    mockHistory.splice(index, 1);
    return { success: true, id };
  }

  // Clear all history
  static async clearHistory() {
    await this.simulateDelay();
    
    // In a real app, this would be:
    // const response = await fetch(`${API_BASE_URL}/calculations`, {
    //   method: 'DELETE'
    // });
    // if (!response.ok) throw new Error('Failed to clear history');
    // return await response.json();
    
    mockHistory.length = 0;
    return { success: true, message: 'History cleared' };
  }

  // Get calculation statistics
  static async getStatistics() {
    await this.simulateDelay();
    
    const stats = {
      total: mockHistory.length,
      byOperation: {},
      recentCalculations: mockHistory.slice(0, 5)
    };

    mockHistory.forEach(item => {
      stats.byOperation[item.operation] = (stats.byOperation[item.operation] || 0) + 1;
    });

    return stats;
  }

  // Validate calculation parameters
  static validateCalculation(operation, num1, num2) {
    const errors = [];

    if (typeof num1 !== 'number' || isNaN(num1)) {
      errors.push('First number must be a valid number');
    }

    if (operation !== 'sqrt') {
      if (typeof num2 !== 'number' || isNaN(num2)) {
        errors.push('Second number must be a valid number');
      } else if (operation === 'divide' && num2 === 0) {
        errors.push('Cannot divide by zero');
      }
    } else {
      if (num1 < 0) {
        errors.push('Cannot calculate square root of negative number');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default CalculatorAPI;