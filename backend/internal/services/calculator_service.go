package services

import (
	"calculator-backend/internal/models"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
)

// CalculatorService implementa a lógica de negócio para cálculos
type CalculatorService struct {
	history []models.Calculation
}

// NewCalculatorService cria uma nova instância do serviço
func NewCalculatorService() *CalculatorService {
	return &CalculatorService{
		history: make([]models.Calculation, 0),
	}
}

// Calculate processa uma expressão matemática
func (s *CalculatorService) Calculate(req models.CalculationRequest) (*models.CalculationResponse, error) {
	if req.Expression == "" {
		return nil, errors.New("expressão não pode ser vazia")
	}

	// Parse e avalia a expressão
	result, operation, err := s.evaluateExpression(req.Expression)
	if err != nil {
		return &models.CalculationResponse{
			ID:         uuid.New().String(),
			Expression: req.Expression,
			Result:     0,
			Timestamp:  time.Now(),
			Success:    false,
			Error:      err.Error(),
		}, nil
	}

	// Cria o cálculo
	calculation := models.Calculation{
		ID:         uuid.New().String(),
		Expression: req.Expression,
		Result:     result,
		Timestamp:  time.Now(),
		Operation:  operation,
	}

	// Adiciona ao histórico
	s.history = append(s.history, calculation)

	return &models.CalculationResponse{
		ID:         calculation.ID,
		Expression: calculation.Expression,
		Result:     calculation.Result,
		Timestamp:  calculation.Timestamp,
		Success:    true,
	}, nil
}

// GetHistory retorna o histórico de cálculos
func (s *CalculatorService) GetHistory(page, pageSize int) models.CalculationHistory {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}

	total := len(s.history)
	start := (page - 1) * pageSize
	end := start + pageSize

	if start >= total {
		return models.CalculationHistory{
			Calculations: []models.Calculation{},
			Total:        total,
			Page:         page,
			PageSize:     pageSize,
		}
	}

	if end > total {
		end = total
	}

	// Retorna em ordem reversa (mais recente primeiro)
	reversedHistory := make([]models.Calculation, len(s.history))
	copy(reversedHistory, s.history)
	for i, j := 0, len(reversedHistory)-1; i < j; i, j = i+1, j-1 {
		reversedHistory[i], reversedHistory[j] = reversedHistory[j], reversedHistory[i]
	}

	return models.CalculationHistory{
		Calculations: reversedHistory[start:end],
		Total:        total,
		Page:         page,
		PageSize:     pageSize,
	}
}

// GetCalculationByID busca um cálculo pelo ID
func (s *CalculatorService) GetCalculationByID(id string) (*models.Calculation, error) {
	for _, calc := range s.history {
		if calc.ID == id {
			return &calc, nil
		}
	}
	return nil, fmt.Errorf("cálculo com ID %s não encontrado", id)
}

// ClearHistory limpa o histórico de cálculos
func (s *CalculatorService) ClearHistory() {
	s.history = make([]models.Calculation, 0)
}

// evaluateExpression avalia uma expressão matemática simples
func (s *CalculatorService) evaluateExpression(expr string) (float64, string, error) {
	expr = strings.TrimSpace(expr)
	
	// Suporte para operações básicas: +, -, *, /
	parts := strings.Fields(expr)
	if len(parts) != 3 {
		// Tenta parsear como expressão simples (ex: "2+3")
		for _, op := range []string{"+", "-", "*", "/"} {
			if strings.Contains(expr, op) {
				parts = strings.Split(expr, op)
				if len(parts) == 2 {
					parts = []string{parts[0], op, parts[1]}
					break
				}
			}
		}
	}

	if len(parts) != 3 {
		return 0, "", errors.New("expressão inválida. Use formato: número operador número")
	}

	a, err := strconv.ParseFloat(strings.TrimSpace(parts[0]), 64)
	if err != nil {
		return 0, "", fmt.Errorf("primeiro número inválido: %v", err)
	}

	b, err := strconv.ParseFloat(strings.TrimSpace(parts[2]), 64)
	if err != nil {
		return 0, "", fmt.Errorf("segundo número inválido: %v", err)
	}

	operation := parts[1]
	var result float64

	switch operation {
	case "+":
		result = a + b
	case "-":
		result = a - b
	case "*":
		result = a * b
	case "/":
		if b == 0 {
			return 0, "", errors.New("divisão por zero")
		}
		result = a / b
	default:
		return 0, "", fmt.Errorf("operador inválido: %s. Use +, -, *, /", operation)
	}

	return result, operation, nil
}