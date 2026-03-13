package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"deeph/internal/catalog"

	"gopkg.in/yaml.v3"
)

type crewConfig struct {
	Name        string         `yaml:"name" json:"name"`
	Description string         `yaml:"description" json:"description,omitempty"`
	Spec        string         `yaml:"spec" json:"spec"`
	Universes   []crewUniverse `yaml:"universes,omitempty" json:"universes,omitempty"`
}

type crewWithSource struct {
	crewConfig
	Source string `json:"source"`
	Kit    string `json:"kit,omitempty"`
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

	userNames := make(map[string]bool, len(crews))
	result := make([]crewWithSource, 0, len(crews)+10)
	for _, c := range crews {
		userNames[c.Name] = true
		result = append(result, crewWithSource{crewConfig: c, Source: "user"})
	}

	for _, sc := range catalog.StandardCrews() {
		if userNames[sc.Name] {
			continue
		}
		var cc crewConfig
		yaml.Unmarshal([]byte(sc.Content), &cc)
		result = append(result, crewWithSource{
			crewConfig: cc,
			Source:     "standard",
			Kit:        sc.Kit,
		})
	}

	sort.Slice(result, func(i, j int) bool { return result[i].Name < result[j].Name })
	json.NewEncoder(w).Encode(result)
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

func (s *Server) handleCrewByName(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Extract name from path: /api/crews/{name}
	nameFromURL := strings.TrimPrefix(r.URL.Path, "/api/crews/")
	nameFromURL = strings.TrimSuffix(nameFromURL, "/")
	nameFromURL = strings.TrimSpace(nameFromURL)
	if nameFromURL == "" {
		http.Error(w, `{"error": "crew name required"}`, http.StatusBadRequest)
		return
	}
	// Sanitization — prevents path traversal
	if strings.ContainsAny(nameFromURL, `/\`) || strings.Contains(nameFromURL, "..") {
		http.Error(w, `{"error": "invalid crew name"}`, http.StatusBadRequest)
		return
	}

	// Find the existing file path based on the name from the URL
	existingFilePath, err := s.findCrewFile(nameFromURL)
	if err != nil && !os.IsNotExist(err) {
		http.Error(w, fmt.Sprintf(`{"error": "failed to check crew file: %v"}`, err), http.StatusInternalServerError)
		return
	}
	crewExists := err == nil

	if r.Method == http.MethodPut {
		var crew crewConfig
		if err := json.NewDecoder(r.Body).Decode(&crew); err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "invalid json: %v"}`, err), http.StatusBadRequest)
			return
		}

		// If crew.Name is not provided in the body, use the name from the URL
		if crew.Name == "" {
			crew.Name = nameFromURL
		} else {
			crew.Name = strings.TrimSpace(crew.Name)
			if strings.ContainsAny(crew.Name, `/\`) || strings.Contains(crew.Name, "..") {
				http.Error(w, `{"error": "invalid crew name in body"}`, http.StatusBadRequest)
				return
			}
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

		// If the name changed, check if the new name already exists
		if crew.Name != nameFromURL {
			if _, err := s.findCrewFile(crew.Name); err == nil {
				http.Error(w, fmt.Sprintf(`{"error": "crew '%s' already exists"}`, crew.Name), http.StatusConflict)
				return
			}
		}

		b, err := yaml.Marshal(&crew)
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "yaml marshal: %v"}`, err), http.StatusInternalServerError)
			return
		}

		newFilePath := filepath.Join(s.crewDir(), crew.Name+".yaml")

		// If the name changed, delete the old file
		if crew.Name != nameFromURL && crewExists {
			if err := os.Remove(existingFilePath); err != nil && !os.IsNotExist(err) {
				http.Error(w, fmt.Sprintf(`{"error": "failed to delete old crew file: %v"}`, err), http.StatusInternalServerError)
				return
			}
		}

		if err := os.WriteFile(newFilePath, b, 0o644); err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "write: %v"}`, err), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(crew)
		return
	}

	if r.Method == http.MethodDelete {
		if !crewExists {
			http.Error(w, `{"error": "crew not found"}`, http.StatusNotFound)
			return
		}
		if err := os.Remove(existingFilePath); err != nil && !os.IsNotExist(err) {
			http.Error(w, fmt.Sprintf(`{"error": "failed to delete: %v"}`, err), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status": "deleted"}`))
		return
	}

	http.Error(w, `{"error": "method not allowed"}`, http.StatusMethodNotAllowed)
}

// findCrewFile returns the full path of the crew file for the given name,
// checking both .yaml and .yml extensions. Returns os.ErrNotExist if neither is found.
func (s *Server) findCrewFile(name string) (string, error) {
	for _, ext := range []string{".yaml", ".yml"} {
		p := filepath.Join(s.crewDir(), name+ext)
		if _, err := os.Stat(p); err == nil {
			return p, nil
		}
	}
	return "", os.ErrNotExist
}
