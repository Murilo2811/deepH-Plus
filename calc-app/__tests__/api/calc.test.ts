import { POST } from '@/app/api/calc/route';
import { GET } from '@/app/api/calc/history/route';
import { evaluate } from '@/lib/evaluator';

// Mock the global history
const mockHistory: any[] = [];

beforeEach(() => {
  // Reset global history before each test
  (global as any).history = [...mockHistory];
});

describe('Evaluator', () => {
  test('evaluates simple addition', () => {
    expect(evaluate('2 + 2')).toBe(4);
  });

  test('evaluates subtraction', () => {
    expect(evaluate('10 - 5')).toBe(5);
  });

  test('evaluates multiplication', () => {
    expect(evaluate('3 * 4')).toBe(12);
  });

  test('evaluates division', () => {
    expect(evaluate('20 / 4')).toBe(5);
  });

  test('evaluates complex expression', () => {
    expect(evaluate('(2 + 3) * 4')).toBe(20);
  });

  test('handles decimal numbers', () => {
    expect(evaluate('3.5 + 2.5')).toBe(6);
  });

  test('throws error for invalid characters', () => {
    expect(() => evaluate('2 + abc')).toThrow('Expression contains invalid characters');
  });

  test('throws error for unbalanced parentheses', () => {
    expect(() => evaluate('(2 + 3')).toThrow('Unbalanced parentheses');
  });

  test('throws error for division by zero', () => {
    expect(() => evaluate('5 / 0')).toThrow('Division by zero is not allowed');
  });

  test('throws error for consecutive operators', () => {
    expect(() => evaluate('2 ++ 3')).toThrow('Consecutive operators are not allowed');
  });
});

describe('POST /api/calc', () => {
  test('calculates valid expression', async () => {
    const request = new Request('http://localhost:3000/api/calc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expression: '2 + 3 * 4' }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.result).toBe(14);
  });

  test('returns error for missing expression', async () => {
    const request = new Request('http://localhost:3000/api/calc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Expression is required and must be a string');
  });

  test('returns error for invalid expression', async () => {
    const request = new Request('http://localhost:3000/api/calc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expression: '2 + abc' }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  test('stores calculation in history', async () => {
    // Clear history first
    (global as any).history = [];

    const request = new Request('http://localhost:3000/api/calc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expression: '5 * 5' }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.result).toBe(25);
    expect((global as any).history).toHaveLength(1);
    expect((global as any).history[0].expression).toBe('5 * 5');
    expect((global as any).history[0].result).toBe(25);
  });
});

describe('GET /api/calc/history', () => {
  test('returns empty history when none exists', async () => {
    (global as any).history = [];

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.history).toEqual([]);
  });

  test('returns calculation history', async () => {
    // Setup mock history
    (global as any).history = [
      { expression: '2 + 2', result: 4, timestamp: '2024-01-01T00:00:00.000Z' },
      { expression: '3 * 3', result: 9, timestamp: '2024-01-01T00:01:00.000Z' },
    ];

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.history).toHaveLength(2);
    expect(data.history[0].expression).toBe('2 + 2');
    expect(data.history[0].result).toBe(4);
    expect(data.history[1].expression).toBe('3 * 3');
    expect(data.history[1].result).toBe(9);
  });

  test('limits history to 20 entries', async () => {
    // Create 25 entries
    (global as any).history = Array.from({ length: 25 }, (_, i) => ({
      expression: `${i} + ${i}`,
      result: i * 2,
      timestamp: new Date().toISOString(),
    }));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.history).toHaveLength(20);
  });
});