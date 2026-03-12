import React, { useState } from 'react';
import './Calculator.css';

const Calculator = ({ onCalculate }) => {
  const [formData, setFormData] = useState({
    num1: '',
    num2: '',
    operation: 'add'
  });
  const [result, setResult] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const operations = [
    { value: 'add', label: 'Addition (+)', symbol: '+' },
    { value: 'subtract', label: 'Subtraction (-)', symbol: '-' },
    { value: 'multiply', label: 'Multiplication (×)', symbol: '×' },
    { value: 'divide', label: 'Division (÷)', symbol: '÷' },
    { value: 'power', label: 'Power (^)', symbol: '^' },
    { value: 'sqrt', label: 'Square Root (√)', symbol: '√' }
  ];

  const validateForm = () => {
    const errors = {};
    
    if (!formData.num1.trim()) {
      errors.num1 = 'First number is required';
    } else if (isNaN(Number(formData.num1))) {
      errors.num1 = 'Must be a valid number';
    }

    if (formData.operation !== 'sqrt') {
      if (!formData.num2.trim()) {
        errors.num2 = 'Second number is required';
      } else if (isNaN(Number(formData.num2))) {
        errors.num2 = 'Must be a valid number';
      } else if (formData.operation === 'divide' && Number(formData.num2) === 0) {
        errors.num2 = 'Cannot divide by zero';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleOperationChange = (e) => {
    const operation = e.target.value;
    setFormData(prev => ({
      ...prev,
      operation
    }));
    // Clear result when operation changes
    setResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setCalculating(true);
    setResult(null);

    try {
      const calculationResult = await onCalculate(
        formData.operation,
        parseFloat(formData.num1),
        formData.operation !== 'sqrt' ? parseFloat(formData.num2) : null
      );
      
      setResult({
        value: calculationResult.result,
        operation: formData.operation,
        num1: formData.num1,
        num2: formData.operation !== 'sqrt' ? formData.num2 : null,
        timestamp: new Date().toISOString()
      });

      // Reset form for next calculation
      setFormData({
        num1: '',
        num2: '',
        operation: formData.operation
      });
    } catch (error) {
      setFormErrors({
        submit: error.message || 'Calculation failed. Please try again.'
      });
    } finally {
      setCalculating(false);
    }
  };

  const handleClear = () => {
    setFormData({
      num1: '',
      num2: '',
      operation: 'add'
    });
    setResult(null);
    setFormErrors({});
  };

  const getOperationSymbol = () => {
    const op = operations.find(o => o.value === formData.operation);
    return op ? op.symbol : '+';
  };

  return (
    <div className="calculator">
      <div className="calculator-header">
        <h2>Calculator</h2>
        <p>Perform mathematical operations</p>
      </div>

      <form onSubmit={handleSubmit} className="calculator-form">
        <div className="form-group">
          <label htmlFor="operation">Operation:</label>
          <select
            id="operation"
            name="operation"
            value={formData.operation}
            onChange={handleOperationChange}
            className="operation-select"
          >
            {operations.map(op => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="num1">First Number:</label>
          <input
            type="text"
            id="num1"
            name="num1"
            value={formData.num1}
            onChange={handleInputChange}
            placeholder="Enter a number"
            className={formErrors.num1 ? 'error' : ''}
          />
          {formErrors.num1 && (
            <span className="error-message">{formErrors.num1}</span>
          )}
        </div>

        {formData.operation !== 'sqrt' && (
          <div className="form-group">
            <label htmlFor="num2">Second Number:</label>
            <input
              type="text"
              id="num2"
              name="num2"
              value={formData.num2}
              onChange={handleInputChange}
              placeholder="Enter a number"
              className={formErrors.num2 ? 'error' : ''}
            />
            {formErrors.num2 && (
              <span className="error-message">{formErrors.num2}</span>
            )}
          </div>
        )}

        {formErrors.submit && (
          <div className="form-error">
            <span className="error-message">{formErrors.submit}</span>
          </div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            className="btn-calculate"
            disabled={calculating}
          >
            {calculating ? 'Calculating...' : 'Calculate'}
          </button>
          <button
            type="button"
            className="btn-clear"
            onClick={handleClear}
          >
            Clear
          </button>
        </div>
      </form>

      {result && (
        <div className="result-display">
          <h3>Result</h3>
          <div className="calculation-expression">
            {formData.operation === 'sqrt' ? (
              <span>√({result.num1}) = {result.value}</span>
            ) : (
              <span>
                {result.num1} {getOperationSymbol()} {result.num2} = {result.value}
              </span>
            )}
          </div>
          <div className="result-details">
            <p>Operation: {operations.find(op => op.value === result.operation)?.label}</p>
            <p>Calculated at: {new Date(result.timestamp).toLocaleString()}</p>
          </div>
        </div>
      )}

      <div className="calculator-info">
        <h4>Available Operations:</h4>
        <ul>
          <li><strong>Addition (+)</strong>: Sum of two numbers</li>
          <li><strong>Subtraction (-)</strong>: Difference between two numbers</li>
          <li><strong>Multiplication (×)</strong>: Product of two numbers</li>
          <li><strong>Division (÷)</strong>: Quotient of two numbers</li>
          <li><strong>Power (^)</strong>: First number raised to the power of second number</li>
          <li><strong>Square Root (√)</strong>: Square root of a number</li>
        </ul>
      </div>
    </div>
  );
};

export default Calculator;