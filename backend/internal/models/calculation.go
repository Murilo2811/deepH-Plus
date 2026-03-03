package models

import (
	"time"
)

// Calculation representa uma operação matemática
type Calculation struct {
	ID        string    `json:"id"`
	Expression string   `json:"expression"`
	Result     float64  `json:"result"`
	Timestamp  time.Time `json:"timestamp"`
	Operation  string   `json:"operation"` // add, subtract, multiply, divide, etc.
}

// CalculationRequest representa a requisição para um cálculo
type CalculationRequest struct {
	Expression string `json:"expression" binding:"required"`
}

// CalculationResponse representa a resposta de um cálculo
type CalculationResponse struct {
	ID         string    `json:"id"`
	Expression string    `json:"expression"`
	Result     float64   `json:"result"`
	Timestamp  time.Time `json:"timestamp"`
	Success    bool      `json:"success"`
	Error      string    `json:"error,omitempty"`
}

// CalculationHistory representa o histórico de cálculos
type CalculationHistory struct {
	Calculations []Calculation `json:"calculations"`
	Total        int           `json:"total"`
	Page         int           `json:"page"`
	PageSize     int           `json:"pageSize"`
}

// ErrorResponse representa uma resposta de erro padronizada
type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message"`
	Code    int    `json:"code"`
}