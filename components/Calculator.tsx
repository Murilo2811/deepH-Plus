'use client';

import { useState, useEffect, useCallback } from 'react';

type Operation = 'add' | 'subtract' | 'multiply' | 'divide' | null;

export default function Calculator() {
  const [currentInput, setCurrentInput] = useState<string>('0');
  const [previousInput, setPreviousInput] = useState<string | null>(null);
  const [operation, setOperation] = useState<Operation>(null);
  const [waitingForNewInput, setWaitingForNewInput] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const resetCalculator = useCallback(() => {
    setCurrentInput('0');
    setPreviousInput(null);
    setOperation(null);
    setWaitingForNewInput(false);
    setIsLoading(false);
    setError('');
  }, []);

  const appendNumber = useCallback((num: string) => {
    if (waitingForNewInput) {
      setCurrentInput(num);
      setWaitingForNewInput(false);
    } else {
      setCurrentInput(prev => prev === '0' ? num : prev + num);
    }
    setError('');
  }, [waitingForNewInput]);

  const addDecimal = useCallback(() => {
    if (waitingForNewInput) {
      setCurrentInput('0.');
      setWaitingForNewInput(false);
    } else if (!currentInput.includes('.')) {
      setCurrentInput(prev => prev + '.');
    }
    setError('');
  }, [currentInput, waitingForNewInput]);

  const setOperationHandler = useCallback((op: Operation) => {
    if (isLoading) return;

    if (operation !== null && !waitingForNewInput) {
      calculateResult();
    }

    setPreviousInput(currentInput);
    setOperation(op);
    setWaitingForNewInput(true);
    setError('');
  }, [currentInput, isLoading, operation, waitingForNewInput]);

  const calculateResult = useCallback(async () => {
    if (operation === null || previousInput === null || isLoading) {
      return;
    }

    const a = parseFloat(previousInput);
    const b = parseFloat(currentInput);

    if (isNaN(a) || isNaN(b)) {
      setError('Invalid numbers');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // API call to backend
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          a,
          b,
          operation: operation.toUpperCase(),
        }),
      });

      if (!response.ok) {
        throw new Error('Calculation failed');
      }

      const data = await response.json();
      
      setCurrentInput(data.result.toString());
      setPreviousInput(null);
      setOperation(null);
      setWaitingForNewInput(true);
    } catch (err: any) {
      setError(err.message || 'Calculation error');
    } finally {
      setIsLoading(false);
    }
  }, [currentInput, previousInput, operation, isLoading]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;

      if (key >= '0' && key <= '9') {
        appendNumber(key);
      } else if (key === '.') {
        addDecimal();
      } else if (key === '+') {
        setOperationHandler('add');
      } else if (key === '-') {
        setOperationHandler('subtract');
      } else if (key === '*') {
        setOperationHandler('multiply');
      } else if (key === '/') {
        event.preventDefault();
        setOperationHandler('divide');
      } else if (key === 'Enter' || key === '=') {
        calculateResult();
      } else if (key === 'Escape' || key === 'Delete') {
        resetCalculator();
      } else if (key === 'Backspace') {
        if (currentInput.length > 1) {
          setCurrentInput(prev => prev.slice(0, -1));
        } else {
          setCurrentInput('0');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [appendNumber, addDecimal, setOperationHandler, calculateResult, resetCalculator, currentInput]);

  const getOperationSymbol = (op: Operation) => {
    switch (op) {
      case 'add': return '+';
      case 'subtract': return '−';
      case 'multiply': return '×';
      case 'divide': return '÷';
      default: return '';
    }
  };

  return (
    <div className="calculator">
      <style jsx>{`
        :root {
          --bg-primary: #1a1a1a;
          --bg-display: #2d2d2d;
          --bg-number: #3a3a3a;
          --bg-operation: #ff9500;
          --bg-clear: #ff3b30;
          --bg-equals: #34c759;
          --text-primary: #ffffff;
          --text-secondary: #cccccc;
          --shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .calculator {
          background-color: var(--bg-primary);
          border-radius: 20px;
          padding: 24px;
          max-width: 400px;
          width: 100%;
          box-shadow: var(--shadow);
        }

        .display {
          background-color: var(--bg-display);
          border-radius: 12px;
          padding: 24px 20px;
          margin-bottom: 24px;
          text-align: right;
          min-height: 140px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          overflow: hidden;
        }

        .previous-operation {
          font-size: 1.25rem;
          color: var(--text-secondary);
          margin-bottom: 8px;
          min-height: 1.75rem;
          font-family: 'Courier New', monospace;
          word-break: break-all;
        }

        .current-input {
          font-size: 2.5rem;
          font-weight: 300;
          font-family: 'Courier New', monospace;
          word-break: break-all;
          line-height: 1.2;
        }

        .keypad {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        @media (max-width: 640px) {
          .keypad {
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
          }
        }

        .button {
          border: none;
          border-radius: 12px;
          font-size: 1.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          justify-content: center;
          align-items: center;
          aspect-ratio: 1;
          user-select: none;
        }

        .button:hover {
          filter: brightness(1.15);
          transform: translateY(-2px);
        }

        .button:active {
          transform: translateY(0);
          filter: brightness(0.95);
        }

        .button.number {
          background-color: var(--bg-number);
          color: var(--text-primary);
        }

        .button.operation {
          background-color: var(--bg-operation);
          color: white;
        }

        .button.clear {
          background-color: var(--bg-clear);
          color: white;
        }

        .button.equals {
          background-color: var(--bg-equals);
          color: white;
        }

        .button.span-two {
          grid-column: span 2;
          aspect-ratio: auto;
        }

        .button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }

        .loading {
          opacity: 0.7;
          position: relative;
        }

        .loading::after {
          content: '';
          position: absolute;
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .error-message {
          color: #ff6b6b;
          text-align: center;
          margin-top: 16px;
          min-height: 1.5rem;
          font-size: 0.95rem;
        }
      `}</style>

      <div className="display">
        <div className="previous-operation">
          {previousInput !== null && operation !== null && (
            `${previousInput} ${getOperationSymbol(operation)}`
          )}
        </div>
        <div className="current-input">{currentInput}</div>
      </div>

      <div className="keypad">
        <button 
          className="button clear span-two" 
          onClick={resetCalculator}
          disabled={isLoading}
        >
          C
        </button>
        <button 
          className="button operation" 
          onClick={() => setOperationHandler('divide')}
          disabled={isLoading}
        >
          ÷
        </button>
        <button 
          className="button operation" 
          onClick={() => setOperationHandler('multiply')}
          disabled={isLoading}
        >
          ×
        </button>

        <button 
          className="button number" 
          onClick={() => appendNumber('7')}
          disabled={isLoading}
        >
          7
        </button>
        <button 
          className="button number" 
          onClick={() => appendNumber('8')}
          disabled={isLoading}
        >
          8
        </button>
        <button 
          className="button number" 
          onClick={() => appendNumber('9')}
          disabled={isLoading}
        >
          9
        </button>
        <button 
          className="button operation" 
          onClick={() => setOperationHandler('subtract')}
          disabled={isLoading}
        >
          −
        </button>

        <button 
          className="button number" 
          onClick={() => appendNumber('4')}
          disabled={isLoading}
        >
          4
        </button>
        <button 
          className="button number" 
          onClick={() => appendNumber('5')}
          disabled={isLoading}
        >
          5
        </button>
        <button 
          className="button number" 
          onClick={() => appendNumber('6')}
          disabled={isLoading}
        >
          6
        </button>
        <button 
          className="button operation" 
          onClick={() => setOperationHandler('add')}
          disabled={isLoading}
        >
          +
        </button>

        <button 
          className="button number" 
          onClick={() => appendNumber('1')}
          disabled={isLoading}
        >
          1
        </button>
        <button 
          className="button number" 
          onClick={() => appendNumber('2')}
          disabled={isLoading}
        >
          2
        </button>
        <button 
          className="button number" 
          onClick={() => appendNumber('3')}
          disabled={isLoading}
        >
          3
        </button>
        <button 
          className={`button equals ${isLoading ? 'loading' : ''}`}
          onClick={calculateResult}
          disabled={isLoading}
          style={{ gridRow: 'span 2' }}
        >
          {!isLoading && '='}
        </button>

        <button 
          className="button number span-two" 
          onClick={() => appendNumber('0')}
          disabled={isLoading}
        >
          0
        </button>
        <button 
          className="button number" 
          onClick={addDecimal}
          disabled={isLoading}
        >
          .
        </button>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}
    </div>
  );
}