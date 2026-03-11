'use client';

import { useState } from 'react';
import { CalculatorOperation, OperationType } from '@/types/calculator';

interface CalculatorFormProps {
  onSubmit: (operation: CalculatorOperation) => void;
  loading: boolean;
}

const OPERATIONS: { value: OperationType; label: string; symbol: string }[] = [
  { value: 'add', label: 'Addition', symbol: '+' },
  { value: 'subtract', label: 'Subtraction', symbol: '-' },
  { value: 'multiply', label: 'Multiplication', symbol: '×' },
  { value: 'divide', label: 'Division', symbol: '÷' },
  { value: 'power', label: 'Power', symbol: '^' },
  { value: 'sqrt', label: 'Square Root', symbol: '√' },
];

export default function CalculatorForm({ onSubmit, loading }: CalculatorFormProps) {
  const [value1, setValue1] = useState<string>('');
  const [value2, setValue2] = useState<string>('');
  const [operation, setOperation] = useState<OperationType>('add');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate value1
    if (!value1.trim()) {
      newErrors.value1 = 'First value is required';
    } else if (isNaN(Number(value1))) {
      newErrors.value1 = 'Must be a valid number';
    }

    // Validate value2 based on operation
    if (operation !== 'sqrt') {
      if (!value2.trim()) {
        newErrors.value2 = 'Second value is required';
      } else if (isNaN(Number(value2))) {
        newErrors.value2 = 'Must be a valid number';
      } else if (operation === 'divide' && Number(value2) === 0) {
        newErrors.value2 = 'Cannot divide by zero';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const operationData: CalculatorOperation = {
      value1: Number(value1),
      value2: operation !== 'sqrt' ? Number(value2) : undefined,
      operation,
    };

    onSubmit(operationData);
  };

  const handleReset = () => {
    setValue1('');
    setValue2('');
    setOperation('add');
    setErrors({});
  };

  const selectedOperation = OPERATIONS.find(op => op.value === operation);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Operation Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Operation
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {OPERATIONS.map((op) => (
            <button
              key={op.value}
              type="button"
              onClick={() => setOperation(op.value)}
              className={`
                p-3 rounded-lg border transition-all
                ${operation === op.value
                  ? 'bg-blue-100 border-blue-500 text-blue-700'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <div className="font-medium">{op.symbol}</div>
              <div className="text-xs mt-1">{op.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Values Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Value 1 */}
        <div>
          <label htmlFor="value1" className="block text-sm font-medium text-gray-700 mb-1">
            First Value
          </label>
          <input
            id="value1"
            type="text"
            value={value1}
            onChange={(e) => setValue1(e.target.value)}
            className={`
              w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${errors.value1 ? 'border-red-500' : 'border-gray-300'}
            `}
            placeholder="Enter number"
            disabled={loading}
          />
          {errors.value1 && (
            <p className="mt-1 text-sm text-red-600">{errors.value1}</p>
          )}
        </div>

        {/* Value 2 - Conditionally rendered */}
        {operation !== 'sqrt' && (
          <div>
            <label htmlFor="value2" className="block text-sm font-medium text-gray-700 mb-1">
              Second Value
            </label>
            <input
              id="value2"
              type="text"
              value={value2}
              onChange={(e) => setValue2(e.target.value)}
              className={`
                w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${errors.value2 ? 'border-red-500' : 'border-gray-300'}
              `}
              placeholder="Enter number"
              disabled={loading}
            />
            {errors.value2 && (
              <p className="mt-1 text-sm text-red-600">{errors.value2}</p>
            )}
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="text-sm text-gray-600 mb-1">Preview</div>
        <div className="text-lg font-mono">
          {value1 || '?'} 
          <span className="mx-2 text-blue-600">
            {selectedOperation?.symbol || '+'}
          </span>
          {operation !== 'sqrt' ? (value2 || '?') : ''}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className={`
            flex-1 px-6 py-3 rounded-lg font-medium transition-colors
            ${loading
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
            }
            text-white
          `}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Calculating...
            </span>
          ) : (
            'Calculate'
          )}
        </button>

        <button
          type="button"
          onClick={handleReset}
          disabled={loading}
          className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
        >
          Reset
        </button>
      </div>
    </form>
  );
}