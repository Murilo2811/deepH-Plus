package api

import (
	"fmt"
	"net/http"

	"deeph/site"
)

// Server serves the deepH UI and REST API over HTTP.
type Server struct {
	workspace string
	addr      string
	termPool  *TerminalPool
}

// NewServer creates a new Server bound to the given workspace and listen address.
func NewServer(workspace string, addr string) *Server {
	return &Server{
		workspace: workspace,
		addr:      addr,
		termPool:  NewTerminalPool(),
	}
}

// Start registers all routes, injects API keys, and begins serving HTTP.
func (s *Server) Start() error {
	s.loadAndInjectKeys()

	mux := http.NewServeMux()

	// Agent CRUD
	mux.HandleFunc("/api/agents", s.handleAgents)
	mux.HandleFunc("/api/agents/", s.handleAgentByName)

	// Config & keys
	mux.HandleFunc("/api/config", s.handleConfig)
	mux.HandleFunc("/api/config/keys", s.handleConfigKeys)
	mux.HandleFunc("/api/providers", s.handleProviders)

	// Skills CRUD
	mux.HandleFunc("/api/skills", s.handleSkills)
	mux.HandleFunc("/api/skills/", s.handleSkillByName)

	// Kits
	mux.HandleFunc("/api/kits", s.handleKitList)
	mux.HandleFunc("/api/kits/install", s.handleKitInstall)

	// Crews
	mux.HandleFunc("/api/crews", s.handleCrews)
	mux.HandleFunc("/api/crews/", s.handleCrewByName)

	// Execution
	mux.HandleFunc("/api/run", s.handleRun)
	mux.HandleFunc("/api/chat/stream", s.handleChatStream)
	mux.HandleFunc("/api/standard-library", s.handleStandardLibrary)

	// Terminals REST
	mux.HandleFunc("/api/terminals", s.handleTerminals)
	mux.HandleFunc("/api/terminals/", s.handleTerminalByID)

	// Terminal WebSocket
	mux.HandleFunc("/api/terminal/ws", s.handleTerminalWS)

	// Static site fallback
	mux.Handle("/", http.FileServer(site.GetFS()))

	handler := corsMiddleware(mux)

	fmt.Printf("UI Server running at http://%s\n", s.addr)
	return http.ListenAndServe(s.addr, handler)
}

// corsMiddleware wraps a handler with permissive CORS headers for development.
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
