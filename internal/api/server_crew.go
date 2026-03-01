package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"gopkg.in/yaml.v3"
)

type crewConfig struct {
	Name        string         `yaml:"name" json:"name"`
	Description string         `yaml:"description" json:"description,omitempty"`
	Spec        string         `yaml:"spec" json:"spec"`
	Universes   []crewUniverse `yaml:"universes,omitempty" json:"universes,omitempty"`
}

type crewUniverse struct {
	Name            string   `yaml:"name" json:"name"`
	Description     string   `yaml:"description,omitempty" json:"description,omitempty"`
	Spec            string   `yaml:"spec" json:"spec"`
	InputPrefix     string   `yaml:"input_prefix,omitempty" json:"input_prefix,omitempty"`
	InputSuffix     string   `yaml:"input_suffix,omitempty" json:"input_suffix,omitempty"`
	DependsOn       []string `yaml:"depends_on,omitempty" json:"depends_on,omitempty"`
	InputPort       string   `yaml:"input_port,omitempty" json:"input_port,omitempty"`
	OutputPort      string   `yaml:"output_port,omitempty" json:"output_port,omitempty"`
	OutputKind      string   `yaml:"output_kind,omitempty" json:"output_kind,omitempty"`
	MergePolicy     string   `yaml:"merge_policy,omitempty" json:"merge_policy,omitempty"`
	HandoffMaxChars int      `yaml:"handoff_max_chars,omitempty" json:"handoff_max_chars,omitempty"`
}

func (s *Server) crewDir() string {
	return filepath.Join(s.workspace, "crews")
}

func (s *Server) handleCrews(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	switch r.Method {
	case http.MethodGet:
		s.listCrews(w, r)
	case http.MethodPost:
		s.createCrew(w, r)
	default:
		http.Error(w, `{"error": "method not allowed"}`, http.StatusMethodNotAllowed)
	}
}

func (s *Server) listCrews(w http.ResponseWriter, _ *http.Request) {
	entries, err := os.ReadDir(s.crewDir())
	if err != nil {
		if os.IsNotExist(err) {
			json.NewEncoder(w).Encode([]crewConfig{})
			return
		}
		http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
		return
	}

	crews := make([]crewConfig, 0, len(entries))
	for _, ent := range entries {
		if ent.IsDir() {
			continue
		}
		name := ent.Name()
		if !strings.HasSuffix(name, ".yaml") && !strings.HasSuffix(name, ".yml") {
			continue
		}
		b, err := os.ReadFile(filepath.Join(s.crewDir(), name))
		if err != nil {
			continue
		}
		var c crewConfig
		if err := yaml.Unmarshal(b, &c); err != nil {
			continue
		}
		crews = append(crews, c)
	}
	sort.Slice(crews, func(i, j int) bool { return crews[i].Name < crews[j].Name })
	json.NewEncoder(w).Encode(crews)
}

func (s *Server) createCrew(w http.ResponseWriter, r *http.Request) {
	var crew crewConfig
	if err := json.NewDecoder(r.Body).Decode(&crew); err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "invalid json: %v"}`, err), http.StatusBadRequest)
		return
	}

	crew.Name = strings.TrimSpace(crew.Name)
	if crew.Name == "" {
		http.Error(w, `{"error": "crew name is required"}`, http.StatusBadRequest)
		return
	}
	// Prevent path traversal
	if strings.ContainsAny(crew.Name, `/\`) || strings.Contains(crew.Name, "..") {
		http.Error(w, `{"error": "invalid crew name"}`, http.StatusBadRequest)
		return
	}
	crew.Spec = strings.TrimSpace(crew.Spec)
	if crew.Spec == "" {
		http.Error(w, `{"error": "crew spec is required"}`, http.StatusBadRequest)
		return
	}

	if err := os.MkdirAll(s.crewDir(), 0o755); err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "mkdir: %v"}`, err), http.StatusInternalServerError)
		return
	}

	b, err := yaml.Marshal(&crew)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "yaml marshal: %v"}`, err), http.StatusInternalServerError)
		return
	}

	filePath := filepath.Join(s.crewDir(), crew.Name+".yaml")
	if err := os.WriteFile(filePath, b, 0o644); err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "write: %v"}`, err), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(crew)
}
