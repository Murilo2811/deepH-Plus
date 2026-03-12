import React, { useState, useEffect } from 'react';
import Calculator from './components/Calculator';
import History from './components/History';
import CalculatorAPI from './api/calculatorAPI';
import './App.css';

function App() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load calculation history on component mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await CalculatorAPI.getHistory();
      setHistory(data);
    } catch (err) {
      setError('Failed to load calculation history');
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async (operation, num1, num2) => {
    setLoading(true);
    setError(null);
    try {
      const result = await CalculatorAPI.calculate(operation, num1, num2);
      // Refresh history after new calculation
      await fetchHistory();
      return result;
    } catch (err) {
      setError(`Calculation failed: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHistory = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await CalculatorAPI.deleteCalculation(id);
      // Refresh history after deletion
      await fetchHistory();
    } catch (err) {
      setError('Failed to delete calculation');
      console.error('Error deleting calculation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      await CalculatorAPI.clearHistory();
      setHistory([]);
    } catch (err) {
      setError('Failed to clear history');
      console.error('Error clearing history:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Calculator CRUD Application</h1>
        <p>Perform calculations and manage your calculation history</p>
      </header>

      <main className="App-main">
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}

        {loading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        )}

        <div className="calculator-section">
          <Calculator onCalculate={handleCalculate} />
        </div>

        <div className="history-section">
          <History 
            history={history}
            onDelete={handleDeleteHistory}
            onClear={handleClearHistory}
            onRefresh={fetchHistory}
          />
        </div>
      </main>

      <footer className="App-footer">
        <p>Calculator CRUD UI - Built with React</p>
      </footer>
    </div>
  );
}

export default App;