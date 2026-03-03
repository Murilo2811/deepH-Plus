package controllers

import (
	"calculator-backend/internal/models"
	"calculator-backend/internal/services"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// CalculatorController gerencia as requisições HTTP para cálculos
type CalculatorController struct {
	service *services.CalculatorService
}

// NewCalculatorController cria uma nova instância do controlador
func NewCalculatorController(service *services.CalculatorService) *CalculatorController {
	return &CalculatorController{
		service: service,
	}
}

// CalculateHandler processa uma requisição de cálculo
func (c *CalculatorController) CalculateHandler(ctx *gin.Context) {
	var req models.CalculationRequest
	
	// Valida a requisição
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "BAD_REQUEST",
			Message: "Requisição inválida: " + err.Error(),
			Code:    http.StatusBadRequest,
		})
		return
	}

	// Processa o cálculo
	response, err := c.service.Calculate(req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "INTERNAL_ERROR",
			Message: "Erro ao processar cálculo: " + err.Error(),
			Code:    http.StatusInternalServerError,
		})
		return
	}

	// Retorna a resposta apropriada baseada no sucesso
	if response.Success {
		ctx.JSON(http.StatusOK, response)
	} else {
		ctx.JSON(http.StatusBadRequest, response)
	}
}

// GetHistoryHandler retorna o histórico de cálculos
func (c *CalculatorController) GetHistoryHandler(ctx *gin.Context) {
	// Parse parâmetros de paginação
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(ctx.DefaultQuery("pageSize", "10"))

	// Obtém o histórico
	history := c.service.GetHistory(page, pageSize)

	ctx.JSON(http.StatusOK, history)
}

// GetCalculationByIDHandler busca um cálculo específico pelo ID
func (c *CalculatorController) GetCalculationByIDHandler(ctx *gin.Context) {
	id := ctx.Param("id")
	
	if id == "" {
		ctx.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "BAD_REQUEST",
			Message: "ID é obrigatório",
			Code:    http.StatusBadRequest,
		})
		return
	}

	calculation, err := c.service.GetCalculationByID(id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, models.ErrorResponse{
			Error:   "NOT_FOUND",
			Message: err.Error(),
			Code:    http.StatusNotFound,
		})
		return
	}

	ctx.JSON(http.StatusOK, calculation)
}

// ClearHistoryHandler limpa o histórico de cálculos
func (c *CalculatorController) ClearHistoryHandler(ctx *gin.Context) {
	c.service.ClearHistory()
	
	ctx.JSON(http.StatusOK, gin.H{
		"message": "Histórico limpo com sucesso",
		"success": true,
	})
}

// HealthCheckHandler verifica a saúde da API
func (c *CalculatorController) HealthCheckHandler(ctx *gin.Context) {
	ctx.JSON(http.StatusOK, gin.H{
		"status":  "healthy",
		"service": "calculator-api",
		"version": "1.0.0",
	})
}