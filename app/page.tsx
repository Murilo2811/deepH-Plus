'use client';

import { useState, useEffect } from 'react';
import Calculator from '@/components/Calculator';
import HistoryList from '@/components/HistoryList';
import { CalculationHistory } from '@/types/calculator';
import { getHistory, deleteHistory } from '@/lib/api-client';

export default function Home() {
  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const [loading, setLoading] = useState(false);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await getHistory();
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDeleteHistory = async (id: string) => {
    try {
      await deleteHistory(id);
      await loadHistory(); // Refresh history after deletion
    } catch (err) {
      console.error('Failed to delete history:', err);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Fullstack Calculator</h1>
          <p className="text-gray-400 text-lg">Next.js + TypeScript + API Integration</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calculator Section */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-md">
              <Calculator />
            </div>
            
            <div className="mt-8 text-center text-gray-400 max-w-md">
              <p className="mb-2">Keyboard shortcuts:</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Numbers: 0-9</div>
                <div>Decimal: .</div>
                <div>Add: +</div>
                <div>Subtract: -</div>
                <div>Multiply: *</div>
                <div>Divide: /</div>
                <div>Calculate: Enter or =</div>
                <div>Clear: Escape or Delete</div>
              </div>
            </div>
          </div>

          {/* History Section */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Calculation History</h2>
              <button
                onClick={loadHistory}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                <p className="mt-2 text-gray-400">Loading history...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No calculations yet.</p>
                <p className="text-sm mt-2">Perform calculations to see them here.</p>
              </div>
            ) : (
              <HistoryList 
                history={history} 
                onDelete={handleDeleteHistory}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}