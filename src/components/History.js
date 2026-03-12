import React, { useState } from 'react';
import './History.css';

const History = ({ history, onDelete, onClear, onRefresh }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [confirmClear, setConfirmClear] = useState(false);

  const operations = [
    { value: 'add', label: 'Addition', symbol: '+' },
    { value: 'subtract', label: 'Subtraction', symbol: '-' },
    { value: 'multiply', label: 'Multiplication', symbol: '×' },
    { value: 'divide', label: 'Division', symbol: '÷' },
    { value: 'power', label: 'Power', symbol: '^' },
    { value: 'sqrt', label: 'Square Root', symbol: '√' }
  ];

  const getOperationLabel = (operation) => {
    const op = operations.find(o => o.value === operation);
    return op ? op.label : operation;
  };

  const getOperationSymbol = (operation) => {
    const op = operations.find(o => o.value === operation);
    return op ? op.symbol : operation;
  };

  const formatCalculation = (item) => {
    if (item.operation === 'sqrt') {
      return `√(${item.num1}) = ${item.result}`;
    }
    return `${item.num1} ${getOperationSymbol(item.operation)} ${item.num2} = ${item.result}`;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Filter calculations
  const filteredHistory = history.filter(item => {
    if (filter === 'all') return true;
    return item.operation === filter;
  });

  // Sort calculations
  const sortedHistory = [...filteredHistory].sort((a, b) => {
    const dateA = new Date(a.timestamp);
    const dateB = new Date(b.timestamp);
    
    if (sortBy === 'newest') {
      return dateB - dateA;
    } else {
      return dateA - dateB;
    }
  });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this calculation?')) {
      await onDelete(id);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all calculation history? This action cannot be undone.')) {
      await onClear();
      setConfirmClear(false);
    }
  };

  const getTotalCalculations = () => {
    const counts = {};
    operations.forEach(op => {
      counts[op.value] = history.filter(item => item.operation === op.value).length;
    });
    counts.total = history.length;
    return counts;
  };

  const calculationStats = getTotalCalculations();

  return (
    <div className="history">
      <div className="history-header">
        <h2>Calculation History</h2>
        <div className="history-controls">
          <button onClick={onRefresh} className="btn-refresh">
            Refresh
          </button>
          <button 
            onClick={() => setConfirmClear(true)} 
            className="btn-clear-all"
            disabled={history.length === 0}
          >
            Clear All
          </button>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="empty-history">
          <p>No calculations yet. Perform some calculations to see them here!</p>
        </div>
      ) : (
        <>
          <div className="history-stats">
            <div className="stat-card">
              <h3>Total Calculations</h3>
              <p className="stat-number">{calculationStats.total}</p>
            </div>
            {operations.map(op => (
              calculationStats[op.value] > 0 && (
                <div key={op.value} className="stat-card">
                  <h3>{op.label}</h3>
                  <p className="stat-number">{calculationStats[op.value]}</p>
                </div>
              )
            ))}
          </div>

          <div className="history-filters">
            <div className="filter-group">
              <label htmlFor="filter">Filter by Operation:</label>
              <select
                id="filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Operations</option>
                {operations.map(op => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="sort">Sort by:</label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          <div className="history-list">
            {sortedHistory.length === 0 ? (
              <div className="no-results">
                <p>No calculations found with the selected filter.</p>
              </div>
            ) : (
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Calculation</th>
                    <th>Operation</th>
                    <th>Result</th>
                    <th>Date & Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedHistory.map((item) => (
                    <tr key={item.id} className="history-item">
                      <td className="calculation-expression">
                        {formatCalculation(item)}
                      </td>
                      <td className="operation-type">
                        {getOperationLabel(item.operation)}
                      </td>
                      <td className="result-value">
                        <strong>{item.result}</strong>
                      </td>
                      <td className="calculation-date">
                        {formatDate(item.timestamp)}
                      </td>
                      <td className="actions">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="btn-delete"
                          title="Delete calculation"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="history-summary">
            <p>
              Showing {sortedHistory.length} of {history.length} calculations
              {filter !== 'all' && ` (filtered by ${getOperationLabel(filter)})`}
            </p>
          </div>
        </>
      )}

      {confirmClear && (
        <div className="confirmation-modal">
          <div className="modal-content">
            <h3>Clear All History</h3>
            <p>Are you sure you want to delete all {history.length} calculations? This action cannot be undone.</p>
            <div className="modal-actions">
              <button onClick={handleClearAll} className="btn-confirm">
                Yes, Clear All
              </button>
              <button onClick={() => setConfirmClear(false)} className="btn-cancel">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;