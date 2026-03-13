// API Client for Calculator CRUD operations
export interface Calculation {
  id: string;
  expression: string;
  result: number;
  timestamp: string;
  userId?: string;
}

export interface CreateCalculationDto {
  expression: string;
  userId?: string;
}

export interface UpdateCalculationDto {
  expression?: string;
}

class ApiClient {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';

  // Create a new calculation
  async createCalculation(data: CreateCalculationDto): Promise<Calculation> {
    const response = await fetch(`${this.baseUrl}/calculations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create calculation: ${response.statusText}`);
    }

    return response.json();
  }

  // Get all calculations
  async getCalculations(): Promise<Calculation[]> {
    const response = await fetch(`${this.baseUrl}/calculations`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch calculations: ${response.statusText}`);
    }

    return response.json();
  }

  // Get a single calculation by ID
  async getCalculation(id: string): Promise<Calculation> {
    const response = await fetch(`${this.baseUrl}/calculations/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch calculation: ${response.statusText}`);
    }

    return response.json();
  }

  // Update a calculation
  async updateCalculation(id: string, data: UpdateCalculationDto): Promise<Calculation> {
    const response = await fetch(`${this.baseUrl}/calculations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update calculation: ${response.statusText}`);
    }

    return response.json();
  }

  // Delete a calculation
  async deleteCalculation(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/calculations/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete calculation: ${response.statusText}`);
    }
  }

  // Evaluate an expression directly
  async evaluateExpression(expression: string): Promise<{ result: number }> {
    const response = await fetch(`${this.baseUrl}/calculations/evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ expression }),
    });

    if (!response.ok) {
      throw new Error(`Failed to evaluate expression: ${response.statusText}`);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();