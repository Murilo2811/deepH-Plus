'use client';

import { useState, useEffect } from 'react';

export default function CalculatorPage() {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buttons = [
    '7', '8', '9', '/',
    '4', '5', '6', '*',
    '1', '2', '3', '-',
    '0', '.', '=', '+',
    '(', ')', 'C', '⌫'
  ];

  const handleButtonClick = (value: string) => {
    setError(null);
    
    switch (value) {
      case '=':
        calculate();
        break;
      case 'C':
        setExpression('');
        setResult(null);
        break;
      case '⌫':
        setExpression(prev => prev.slice(0, -1));
        break;
      default:
        setExpression(prev => prev + value);
    }
  };

  const calculate = async () => {
    if (!expression.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/calc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expression }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Calculation failed');
      }
      
      setResult(data.result.toString());
      fetchHistory(); // Refresh history after calculation
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/calc/history');
      const data = await response.json();
      
      if (response.ok) {
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-center mb-2">Next.js Calculator</h1>
          <p className="text-gray-400 text-center">A safe mathematical expression evaluator</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calculator */}
          <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl">
            <div className="mb-6">
              <div className="bg-gray-900 rounded-xl p-4 mb-4">
                <div className="text-gray-400 text-sm mb-1">Expression</div>
                <div className="text-2xl font-mono min-h-[2rem] break-all">
                  {expression || '0'}
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Result</div>
                <div className="text-3xl font-bold font-mono min-h-[3rem]">
                  {loading ? (
                    <span className="text-blue-400">Calculating...</span>
                  ) : error ? (
                    <span className="text-red-400">{error}</span>
                  ) : result !== null ? (
                    <span className="text-green-400">{result}</span>
                  ) : (
                    <span className="text-gray-500">0</span>
                  )}
                </div>
              </div>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-4 gap-3">
              {buttons.map((btn) => (
                <button
                  key={btn}
                  onClick={() => handleButtonClick(btn)}
                  className={`
                    h-16 rounded-xl text-xl font-semibold transition-all duration-200
                    ${['/', '*', '-', '+', '='].includes(btn)
                      ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                      : ['C', '⌫'].includes(btn)
                      ? 'bg-red-600 hover:bg-red-700 active:bg-red-800'
                      : ['(', ')'].includes(btn)
                      ? 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800'
                      : 'bg-gray-700 hover:bg-gray-600 active:bg-gray-500'
                    }
                    ${btn === '=' ? 'col-span-2' : ''}
                  `}
                >
                  {btn}
                </button>
              ))}
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={calculate}
                disabled={loading || !expression.trim()}
                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 rounded-xl text-lg font-bold transition-colors"
              >
                {loading ? 'Calculating...' : 'Calculate'}
              </button>
            </div>
          </div>

          {/* History */}
          <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Calculation History</h2>
            
            {history.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No calculations yet. Start calculating!
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {history.map((entry, index) => (
                  <div
                    key={index}
                    className="bg-gray-900 rounded-xl p-4 hover:bg-gray-850 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-mono text-lg break-all">
                        {entry.expression}
                      </div>
                      <div className="text-green-400 font-bold text-xl ml-4">
                        = {entry.result}
                      </div>
                    </div>
                    <div className="text-gray-400 text-sm">
                      {new Date(entry.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-6 text-center">
              <button
                onClick={fetchHistory}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors"
              >
                Refresh History
              </button>
            </div>
          </div>
        </div>

        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>Safe expression evaluator • Supports +, -, *, /, parentheses, and decimals</p>
          <p className="mt-1">All calculations are validated for safety</p>
        </footer>
      </div>
    </div>
  );
}