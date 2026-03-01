package api

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"deeph/internal/catalog"
	"deeph/internal/project"
	"deeph/internal/runtime"
	"deeph/site"

	"gopkg.in/yaml.v3"
)

type Server struct {
	workspace string
	addr      string
}

func NewServer(workspace string, addr string) *Server {
	return &Server{
		workspace: workspace,
		addr:      addr,
	}
}

func (s *Server) Start() error {
	// Inject API keys from keys.json into environment variables so the runtime providers can read them.
	s.loadAndInjectKeys()

	mux := http.NewServeMux()

	mux.HandleFunc("/api/agents", s.handleAgents)
	mux.HandleFunc("/api/agents/", s.handleAgentByName)
	mux.HandleFunc("/api/config", s.handleConfig)
	mux.HandleFunc("/api/config/keys", s.handleConfigKeys)
	mux.HandleFunc("/api/skills", s.handleSkills)
	mux.HandleFunc("/api/providers", s.handleProviders)
	mux.HandleFunc("/api/chat/stream", s.handleChatStream)

	// Fallback to static site
	mux.Handle("/", http.FileServer(site.GetFS()))

	fmt.Printf("UI Server running at http://%s\n", s.addr)
	return http.ListenAndServe(s.addr, mux)
}

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

// handleConfigKeys handles GET and PUT for /api/config/keys.
// Keys are stored in keys.json as a plain map[string]string {provider: apikey}.
// This keeps secrets out of deeph.yaml and allows the UI to read/write them freely.
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

func (s *Server) handleAgents(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method == http.MethodGet {
		proj, err := project.Load(s.workspace)
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(proj.Agents)
		return
	}

	if r.Method == http.MethodPost {
		var agent project.AgentConfig
		if err := json.NewDecoder(r.Body).Decode(&agent); err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "invalid json: %v"}`, err), http.StatusBadRequest)
			return
		}
		if agent.Name == "" {
			http.Error(w, `{"error": "agent name is required"}`, http.StatusBadRequest)
			return
		}

		agentDir := filepath.Join(s.workspace, "agents")
		_ = os.MkdirAll(agentDir, 0755)

		agentPath := filepath.Join(agentDir, agent.Name+".yaml")
		b, err := yaml.Marshal(&agent)
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "failed to encode yaml: %v"}`, err), http.StatusInternalServerError)
			return
		}

		if err := os.WriteFile(agentPath, b, 0644); err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "failed to write file: %v"}`, err), http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(agent)
		return
	}

	http.Error(w, `{"error": "method not allowed"}`, http.StatusMethodNotAllowed)
}

func (s *Server) handleAgentByName(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Example path: /api/agents/guide
	name := filepath.Base(r.URL.Path)
	if name == "" || name == "agents" {
		http.Error(w, `{"error": "agent name required"}`, http.StatusBadRequest)
		return
	}

	agentPath := filepath.Join(s.workspace, "agents", name+".yaml")

	if r.Method == http.MethodPut {
		var agent project.AgentConfig
		if err := json.NewDecoder(r.Body).Decode(&agent); err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "invalid json: %v"}`, err), http.StatusBadRequest)
			return
		}
		if agent.Name == "" {
			agent.Name = name
		}

		b, err := yaml.Marshal(&agent)
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "failed to encode yaml: %v"}`, err), http.StatusInternalServerError)
			return
		}

		if err := os.WriteFile(agentPath, b, 0644); err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "failed to write file: %v"}`, err), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(agent)
		return
	}

	if r.Method == http.MethodDelete {
		if err := os.Remove(agentPath); err != nil && !os.IsNotExist(err) {
			http.Error(w, fmt.Sprintf(`{"error": "failed to delete: %v"}`, err), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status": "deleted"}`))
		return
	}

	http.Error(w, `{"error": "method not allowed"}`, http.StatusMethodNotAllowed)
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

func (s *Server) handleSkills(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if r.Method != http.MethodGet {
		http.Error(w, `{"error": "method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	// Retornar skills do catálogo
	skills := catalog.List()
	json.NewEncoder(w).Encode(skills)
}

func (s *Server) handleProviders(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if r.Method != http.MethodGet {
		http.Error(w, `{"error": "method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	// Retornar providers conhecidos
	providers := []string{"local_mock", "deepseek", "openai", "anthropic", "xai"}
	json.NewEncoder(w).Encode(providers)
}

type chatRequest struct {
	Agent     string `json:"agent"`
	Message   string `json:"message"`
	SessionID string `json:"session_id,omitempty"`
}

func (s *Server) handleChatStream(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"error": "method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req chatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "invalid json: %v"}`, err), http.StatusBadRequest)
		return
	}

	p, err := project.Load(s.workspace)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
		return
	}

	meta, entries, _, err := openOrCreateChatSession(s.workspace, req.SessionID, req.Agent)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "session error: %v"}`, err), http.StatusInternalServerError)
		return
	}

	eng, err := runtime.New(s.workspace, p)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "runtime error: %v"}`, err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, `{"error": "streaming not supported"}`, http.StatusInternalServerError)
		return
	}

	sendEvent := func(evtType string, data any) {
		b, _ := json.Marshal(data)
		fmt.Fprintf(w, "event: %s\ndata: %s\n\n", evtType, string(b))
		flusher.Flush()
	}

	sendEvent("status", map[string]string{"message": "Iniciando agente..."})

	input := buildChatTurnInputSimple(meta, entries, req.Message, 8)

	ctx := context.Background()
	report, err := eng.RunSpec(ctx, meta.AgentSpec, input)
	if err != nil {
		sendEvent("error", map[string]string{"error": err.Error()})
		return
	}

	var finalOutput string
	var finalError string
	var finalAgent string = meta.AgentSpec

	for i := len(report.Results) - 1; i >= 0; i-- {
		res := report.Results[i]
		if res.Output != "" || res.Error != "" {
			finalOutput = res.Output
			finalError = res.Error
			finalAgent = res.Agent
			break
		}
	}

	if finalError != "" {
		sendEvent("error", map[string]string{"error": finalError})
		return
	}

	meta.Turns++
	now := time.Now()
	meta.UpdatedAt = now

	toAppend := []chatSessionEntry{
		{Turn: meta.Turns, Role: "user", Text: req.Message, CreatedAt: now},
		{Turn: meta.Turns, Role: "assistant", Agent: finalAgent, Text: finalOutput, CreatedAt: now},
	}
	_ = appendChatSessionEntries(s.workspace, meta.ID, toAppend)
	_ = saveChatSessionMeta(s.workspace, meta)

	sendEvent("message", map[string]any{
		"agent":      finalAgent,
		"text":       finalOutput,
		"session_id": meta.ID,
	})
	sendEvent("done", map[string]string{"status": "ok"})
}

func buildChatTurnInputSimple(meta *chatSessionMeta, entries []chatSessionEntry, userMessage string, maxTurns int) string {
	lines := []string{"[chat_session]", "session_id: " + meta.ID, "history:"}

	start := 0
	if len(entries) > maxTurns*2 {
		start = len(entries) - maxTurns*2
	}
	for _, e := range entries[start:] {
		// Truncate to avoid blowing up tokens
		text := strings.TrimSpace(e.Text)
		if len(text) > 400 {
			text = text[:397] + "..."
		}
		lines = append(lines, "- "+e.Role+": "+text)
	}
	lines = append(lines, "current_user_message:")
	lines = append(lines, userMessage)
	lines = append(lines, "instruction: continue the conversation, reuse prior context when relevant, avoid repeating previous answers.")
	return strings.Join(lines, "\n")
}
