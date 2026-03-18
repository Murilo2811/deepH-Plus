package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"

	"deeph/internal/catalog"
	"deeph/internal/project"

	"gopkg.in/yaml.v3"
)

// agentWithSource wraps project.AgentConfig with a source field for JSON output.
type agentWithSource struct {
	project.AgentConfig
	Source string `json:"source"`
	Kit    string `json:"kit,omitempty"`
}

func (s *Server) handleAgents(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method == http.MethodGet {
		proj, err := project.Load(s.workspace)
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
			return
		}

		// Collect user agents with source tag
		userNames := make(map[string]bool, len(proj.Agents))
		result := make([]agentWithSource, 0, len(proj.Agents)+10)
		for _, a := range proj.Agents {
			userNames[a.Name] = true
			result = append(result, agentWithSource{AgentConfig: a, Source: "user"})
		}

		// Append standard agents from catalog (skip if user already has one with the same name)
		for _, sa := range catalog.StandardAgents() {
			if userNames[sa.Name] {
				continue
			}
			result = append(result, agentWithSource{
				AgentConfig: project.AgentConfig{
					Name:        sa.Name,
					Description: sa.Description,
				},
				Source: "standard",
				Kit:    sa.Kit,
			})
		}

		json.NewEncoder(w).Encode(result)
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
