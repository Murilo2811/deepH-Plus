'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api-client';

interface CalculatorProps {
  onCalculate?: (expression: string, result: number) => void;
}

export default function Calculator({ onCalculate }: CalculatorProps) {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleButtonClick = (value: string) => {
    setExpression(prev => prev + value);
    setError(null);
  };

  const handleClear = () => {
    setExpression('');
    setResult(null);
    setError(null);
  };

  const handleBackspace = () => {
    setExpression(prev => prev.slice(0, -1));
    setError(null);
  };

  const handleEvaluate = async () => {
    if (!expression.trim()) {
      setError('Please enter an expression');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const evaluation = await apiClient.evaluateExpression(expression);
      setResult(evaluation.result);
      
      if (onCalculate) {
        onCalculate(expression, evaluation.result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to evaluate expression');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!expression.trim() || result === null) {
      setError('Please evaluate an expression first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await apiClient.createCalculation({ expression });
      setError(null);
      alert('Calculation saved successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save calculation');
    } finally {
      setIsLoading(false);
    }
  };

  const buttons = [
    ['7', '8', '9', '/'],
    ['4', '5', '6', '*'],
    ['1', '2', '3', '-'],
    ['0', '.', '=', '+'],
  ];

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-4">
        <div className="text-2xl font-bold text-gray-800 mb-2">Calculator</div>
        
        {/* Display */}
        <div className="mb-4 p-4 bg-gray-100 rounded-lg">
          <div className="text-right text-gray-600 text-sm mb-1">Expression:</div>
          <div className="text-right text-2xl font-mono mb-2 min-h-[2rem]">
            {expression || '0'}
          </div>
          <div className="text-right text-gray-600 text-sm mb-1">Result:</div>
          <div className="text-right text-3xl font-bold text-blue-600 min-h-[3rem]">
            {result !== null ? result : '0'}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Calculator Buttons */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {buttons.flat().map((btn) => (
          <button
            key={btn}
            onClick={() => btn === '=' ? handleEvaluate() : handleButtonClick(btn)}
            disabled={isLoading}
            className={`p-4 text-xl font-semibold rounded-lg transition-colors ${
              btn === '='
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {btn}
          </button>
        ))}
      </div>

      {/* Control Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleClear}
          disabled={isLoading}
          className="flex-1 p-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold disabled:opacity-50"
        >
          Clear
        </button>
        <button
          onClick={handleBackspace}
          disabled={isLoading}
          className="flex-1 p-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold disabled:opacity-50"
        >
          ⌫ Backspace
        </button>
        <button
          onClick={handleSave}
          disabled={isLoading || result === null}
          className="flex-1 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-50"
        >
          Save
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="mt-4 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Processing...</span>
        </div>
      )}
    </div>
  );
}