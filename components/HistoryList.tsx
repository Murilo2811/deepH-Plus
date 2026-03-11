'use client';

import { CalculationHistory } from '@/types/calculator';

interface HistoryListProps {
  history: CalculationHistory[];
  onDelete: (id: string) => void;
}

const OPERATION_SYMBOLS: Record<string, string> = {
  add: '+',
  subtract: '-',
  multiply: '×',
  divide: '÷',
  power: '^',
  sqrt: '√',
};

const OPERATION_NAMES: Record<string, string> = {
  add: 'Addition',
  subtract: 'Subtraction',
  multiply: 'Multiplication',
  divide: 'Division',
  power: 'Power',
  sqrt: 'Square Root',
};

export default function HistoryList({ history, onDelete }: HistoryListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatCalculation = (item: CalculationHistory) => {
    if (item.operation === 'sqrt') {
      return `√${item.value1}`;
    }
    return `${item.value1} ${OPERATION_SYMBOLS[item.operation]} ${item.value2}`;
  };

  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
      {history.map((item) => (
        <div
          key={item.id}
          className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {/* Header with operation and date */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                    {OPERATION_NAMES[item.operation]}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(item.createdAt)}
                  </span>
                </div>
                
                {item.error && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                    Error
                  </span>
                )}
              </div>

              {/* Calculation display */}
              <div className="mb-2">
                <div className="flex items-center gap-2">
                  <div className="font-mono text-lg">
                    {formatCalculation(item)}
                  </div>
                  <div className="text-gray-400">=</div>
                  {item.error ? (
                    <div className="text-red-600 font-medium">
                      Error: {item.error}
                    </div>
                  ) : (
                    <div className="text-green-600 font-bold text-lg">
                      {item.result}
                    </div>
                  )}
                </div>
              </div>

              {/* Additional info */}
              <div className="text-xs text-gray-500">
                ID: <span className="font-mono">{item.id.slice(0, 8)}...</span>
              </div>
            </div>

            {/* Delete button */}
            <button
              onClick={() => onDelete(item.id)}
              className="ml-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete calculation"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}