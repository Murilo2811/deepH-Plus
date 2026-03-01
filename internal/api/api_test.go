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
	if len(agents) != 1 || agents[0].Name != "test-agent" {
		t.Errorf("expected 1 agent named test-agent, got %v", agents)
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
