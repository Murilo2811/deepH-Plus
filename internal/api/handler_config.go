package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"deeph/internal/project"
)

// providerEnvMap maps the provider ID stored in keys.json to the environment
// variable name expected by the runtime providers.
var providerEnvMap = map[string]string{
	"deepseek":  "DEEPSEEK_API_KEY",
	"openai":    "OPENAI_API_KEY",
	"anthropic": "ANTHROPIC_API_KEY",
	"xai":       "XAI_API_KEY",
	"ollama":    "OLLAMA_API_KEY",
}

// loadAndInjectKeys reads keys.json and sets the corresponding environment variables
// so the runtime can read them via os.Getenv without extra configuration from the user.
func (s *Server) loadAndInjectKeys() {
	b, err := os.ReadFile(s.keysFilePath())
	if err != nil {
		return // keys.json doesn't exist yet — not an error
	}

	var keys map[string]string
	if err := json.Unmarshal(b, &keys); err != nil {
		return
	}

	for providerID, apiKey := range keys {
		if strings.TrimSpace(apiKey) == "" {
			continue
		}
		if envVar, ok := providerEnvMap[strings.ToLower(providerID)]; ok {
			// Only set if not already defined externally, so real env vars take precedence.
			if os.Getenv(envVar) == "" {
				_ = os.Setenv(envVar, apiKey)
			}
		}
	}
}

// keysFilePath returns the path to the local keys storage file.
func (s *Server) keysFilePath() string {
	return filepath.Join(s.workspace, "keys.json")
}

func (s *Server) handleConfig(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method == http.MethodGet {
		proj, err := project.Load(s.workspace)
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(proj.Root)
		return
	}

	if r.Method == http.MethodPut {
		var config project.RootConfig
		if err := json.NewDecoder(r.Body).Decode(&config); err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "invalid json: %v"}`, err), http.StatusBadRequest)
			return
		}

		if err := project.SaveRootConfig(s.workspace, config); err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "failed to save config: %v"}`, err), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(config)
		return
	}

	http.Error(w, `{"error": "method not allowed"}`, http.StatusMethodNotAllowed)
}

// handleConfigKeys handles GET and PUT for /api/config/keys.
// Keys are stored in keys.json as a plain map[string]string {provider: apikey}.
func (s *Server) handleConfigKeys(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	path := s.keysFilePath()

	if r.Method == http.MethodGet {
		keys := map[string]string{}
		if b, err := os.ReadFile(path); err == nil {
			_ = json.Unmarshal(b, &keys)
		}
		json.NewEncoder(w).Encode(keys)
		return
	}

	if r.Method == http.MethodPut {
		var keys map[string]string
		if err := json.NewDecoder(r.Body).Decode(&keys); err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "invalid json: %v"}`, err), http.StatusBadRequest)
			return
		}
		b, err := json.MarshalIndent(keys, "", "  ")
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "marshal: %v"}`, err), http.StatusInternalServerError)
			return
		}
		if err := os.WriteFile(path, b, 0600); err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "write: %v"}`, err), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(keys)
		return
	}

	http.Error(w, `{"error": "method not allowed"}`, http.StatusMethodNotAllowed)
}

func (s *Server) handleProviders(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if r.Method != http.MethodGet {
		http.Error(w, `{"error": "method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	providers := []string{"local_mock", "deepseek", "openai", "anthropic", "xai"}
	json.NewEncoder(w).Encode(providers)
}
