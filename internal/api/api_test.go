package api

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"deeph/internal/project"

	"gopkg.in/yaml.v3"
)

func setupTestWorkspace(t *testing.T) (string, func()) {
	tmpDir, err := os.MkdirTemp("", "deeph-test-*")
	if err != nil {
		t.Fatal(err)
	}

	// Create deeph.yaml
	rootConfig := project.RootConfig{
		Version:         1,
		DefaultProvider: "test-provider",
		Providers: []project.ProviderConfig{
			{
				Name:      "test-provider",
				Type:      "deepseek",
				Model:     "deepseek-chat",
				APIKeyEnv: "TEST_API_KEY",
			},
		},
	}

	b, _ := yaml.Marshal(rootConfig)
	_ = os.WriteFile(filepath.Join(tmpDir, "deeph.yaml"), b, 0644)

	// Create agents dir
	_ = os.MkdirAll(filepath.Join(tmpDir, "agents"), 0755)

	agent := project.AgentConfig{
		Name:         "test-agent",
		Provider:     "test-provider",
		Model:        "deepseek-chat",
		SystemPrompt: "You are a test agent.",
	}
	ab, _ := yaml.Marshal(agent)
	_ = os.WriteFile(filepath.Join(tmpDir, "agents", "test-agent.yaml"), ab, 0644)

	return tmpDir, func() {
		os.RemoveAll(tmpDir)
	}
}

func TestHandleConfig(t *testing.T) {
	workspace, cleanup := setupTestWorkspace(t)
	defer cleanup()

	srv := NewServer(workspace, "localhost:0")

	// Test GET /api/config
	req, _ := http.NewRequest("GET", "/api/config", nil)
	rr := httptest.NewRecorder()
	srv.handleConfig(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", rr.Code)
	}

	var root project.RootConfig
	if err := json.NewDecoder(rr.Body).Decode(&root); err != nil {
		t.Fatal(err)
	}
	if root.DefaultProvider != "test-provider" {
		t.Errorf("expected test-provider, got %s", root.DefaultProvider)
	}

	// Test PUT /api/config (Update)
	root.DefaultProvider = "new-provider"
	body, _ := json.Marshal(root)
	req, _ = http.NewRequest("PUT", "/api/config", bytes.NewBuffer(body))
	rr = httptest.NewRecorder()
	srv.handleConfig(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("PUT expected 200, got %d", rr.Code)
	}
}

func TestHandleConfigKeys(t *testing.T) {
	workspace, cleanup := setupTestWorkspace(t)
	defer cleanup()

	srv := NewServer(workspace, "localhost:0")

	// Test PUT /api/config/keys
	keys := map[string]string{"deepseek": "sk-123", "openai": "sk-456"}
	body, _ := json.Marshal(keys)
	req, _ := http.NewRequest("PUT", "/api/config/keys", bytes.NewBuffer(body))
	rr := httptest.NewRecorder()
	srv.handleConfigKeys(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("PUT expected 200, got %d", rr.Code)
	}

	// Test GET /api/config/keys
	req, _ = http.NewRequest("GET", "/api/config/keys", nil)
	rr = httptest.NewRecorder()
	srv.handleConfigKeys(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("GET expected 200, got %d", rr.Code)
	}

	var savedKeys map[string]string
	json.NewDecoder(rr.Body).Decode(&savedKeys)
	if savedKeys["deepseek"] != "sk-123" {
		t.Errorf("expected sk-123, got %s", savedKeys["deepseek"])
	}
}

func TestHandleAgents(t *testing.T) {
	workspace, cleanup := setupTestWorkspace(t)
	defer cleanup()

	srv := NewServer(workspace, "localhost:0")

	// Test GET /api/agents
	req, _ := http.NewRequest("GET", "/api/agents", nil)
	rr := httptest.NewRecorder()
	srv.handleAgents(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", rr.Code)
	}

	var agents []project.AgentConfig
	json.NewDecoder(rr.Body).Decode(&agents)
	found := false
	for _, a := range agents {
		if a.Name == "test-agent" {
			found = true
			break
		}
	}
	if !found {
		t.Errorf("expected to find test-agent, got %v", agents)
	}

	// Test POST /api/agents (Create new)
	newAgent := project.AgentConfig{
		Name:     "new-agent",
		Provider: "test-provider",
	}
	body, _ := json.Marshal(newAgent)
	req, _ = http.NewRequest("POST", "/api/agents", bytes.NewBuffer(body))
	rr = httptest.NewRecorder()
	srv.handleAgents(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("POST expected 200, got %d", rr.Code)
	}
}

func TestHandleSkillsAndProviders(t *testing.T) {
	workspace, cleanup := setupTestWorkspace(t)
	defer cleanup()

	srv := NewServer(workspace, "localhost:0")

	// Test GET /api/skills
	req, _ := http.NewRequest("GET", "/api/skills", nil)
	rr := httptest.NewRecorder()
	srv.handleSkills(rr, req)
	if rr.Code != http.StatusOK {
		t.Errorf("skills expected 200, got %d", rr.Code)
	}

	// Test GET /api/providers
	req, _ = http.NewRequest("GET", "/api/providers", nil)
	rr = httptest.NewRecorder()
	srv.handleProviders(rr, req)
	if rr.Code != http.StatusOK {
		t.Errorf("providers expected 200, got %d", rr.Code)
	}
}

func TestHandleCrewByName(t *testing.T) {
	workspace, cleanup := setupTestWorkspace(t)
	defer cleanup()

	srv := NewServer(workspace, "localhost:0")

	// Cria o diretório de crews
	crewDir := filepath.Join(workspace, "crews")
	_ = os.MkdirAll(crewDir, 0755)

	// 1) POST /api/crews — cria crew inicial
	crew := map[string]string{"name": "test-crew", "spec": "guide>analyst"}
	body, _ := json.Marshal(crew)
	req, _ := http.NewRequest("POST", "/api/crews", bytes.NewBuffer(body))
	rr := httptest.NewRecorder()
	srv.createCrew(rr, req)
	if rr.Code != http.StatusCreated {
		t.Fatalf("POST expected 201, got %d: %s", rr.Code, rr.Body.String())
	}

	// Verifica que o arquivo existe no disco
	crewFile := filepath.Join(crewDir, "test-crew.yaml")
	if _, err := os.Stat(crewFile); err != nil {
		t.Fatalf("crew file not created: %v", err)
	}

	// 2) PUT /api/crews/test-crew — atualiza crew
	updated := map[string]string{"name": "test-crew", "description": "updated", "spec": "guide+analyst"}
	body, _ = json.Marshal(updated)
	req, _ = http.NewRequest("PUT", "/api/crews/test-crew", bytes.NewBuffer(body))
	rr = httptest.NewRecorder()
	srv.handleCrewByName(rr, req)
	if rr.Code != http.StatusOK {
		t.Errorf("PUT expected 200, got %d: %s", rr.Code, rr.Body.String())
	}
	var updatedCrew map[string]string
	json.NewDecoder(rr.Body).Decode(&updatedCrew)
	if updatedCrew["description"] != "updated" {
		t.Errorf("expected description='updated', got '%s'", updatedCrew["description"])
	}

	// 3) DELETE /api/crews/test-crew — exclui crew
	req, _ = http.NewRequest("DELETE", "/api/crews/test-crew", nil)
	rr = httptest.NewRecorder()
	srv.handleCrewByName(rr, req)
	if rr.Code != http.StatusOK {
		t.Errorf("DELETE expected 200, got %d: %s", rr.Code, rr.Body.String())
	}

	// Verifica que o arquivo foi removido do disco
	if _, err := os.Stat(crewFile); !os.IsNotExist(err) {
		t.Error("crew file should have been deleted")
	}

	// 4) Método inválido
	req, _ = http.NewRequest("PATCH", "/api/crews/test-crew", nil)
	rr = httptest.NewRecorder()
	srv.handleCrewByName(rr, req)
	if rr.Code != http.StatusMethodNotAllowed {
		t.Errorf("PATCH expected 405, got %d", rr.Code)
	}
}
