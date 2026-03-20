package api

import (
	"encoding/json"
	"net/http"
	"strings"
)

// handleTerminals REST: GET/POST
func (s *Server) handleTerminals(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		s.listTerminals(w, r)
	case http.MethodPost:
		s.createTerminal(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// handleTerminalByID REST: DELETE
func (s *Server) handleTerminalByID(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, "/api/terminals/")
	id := strings.TrimSpace(path)
	if id == "" {
		http.Error(w, "ID required", http.StatusBadRequest)
		return
	}

	if r.Method == http.MethodDelete {
		s.termPool.Remove(id)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"success":true}`))
		return
	}
	http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
}

func (s *Server) listTerminals(w http.ResponseWriter, r *http.Request) {
	terms := s.termPool.List()
	if terms == nil {
		terms = []*TerminalSession{}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(terms)
}

func (s *Server) createTerminal(w http.ResponseWriter, r *http.Request) {
	session, err := s.termPool.Create(s.workspace)
	if err != nil {
		http.Error(w, "Failed to create terminal: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(session)
}
