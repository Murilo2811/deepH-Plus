package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"deeph/internal/catalog"

	"gopkg.in/yaml.v3"
)

func (s *Server) handleSkills(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method == http.MethodGet {
		skills := catalog.List() // already have Source:"standard"

		// Add local skills with source:"user"
		dir := filepath.Join(s.workspace, "skills")
		if entries, err := os.ReadDir(dir); err == nil {
			for _, e := range entries {
				if !e.IsDir() && (strings.HasSuffix(e.Name(), ".yaml") || strings.HasSuffix(e.Name(), ".yml")) {
					b, err := os.ReadFile(filepath.Join(dir, e.Name()))
					if err == nil {
						var parsed struct {
							Name        string `yaml:"name"`
							Description string `yaml:"description"`
						}
						_ = yaml.Unmarshal(b, &parsed)
						if parsed.Name == "" {
							parsed.Name = strings.TrimSuffix(e.Name(), filepath.Ext(e.Name()))
						}
						skills = append(skills, catalog.SkillTemplate{
							Name:        parsed.Name,
							Description: parsed.Description,
							Filename:    e.Name(),
							Content:     string(b),
							Source:      "user",
						})
					}
				}
			}
		}

		json.NewEncoder(w).Encode(skills)
		return
	}

	if r.Method == http.MethodPost {
		var skill catalog.SkillTemplate
		if err := json.NewDecoder(r.Body).Decode(&skill); err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "invalid json: %v"}`, err), http.StatusBadRequest)
			return
		}
		if skill.Name == "" {
			http.Error(w, `{"error": "skill name is required"}`, http.StatusBadRequest)
			return
		}

		skillDir := filepath.Join(s.workspace, "skills")
		_ = os.MkdirAll(skillDir, 0755)

		skillPath := filepath.Join(skillDir, skill.Name+".yaml")
		if err := os.WriteFile(skillPath, []byte(skill.Content), 0644); err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "failed to write file: %v"}`, err), http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(skill)
		return
	}

	http.Error(w, `{"error": "method not allowed"}`, http.StatusMethodNotAllowed)
}

func (s *Server) handleSkillByName(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	name := filepath.Base(r.URL.Path)
	if name == "" || name == "skills" {
		http.Error(w, `{"error": "skill name required"}`, http.StatusBadRequest)
		return
	}

	skillPath := filepath.Join(s.workspace, "skills", name+".yaml")

	if r.Method == http.MethodPut {
		var skill catalog.SkillTemplate
		if err := json.NewDecoder(r.Body).Decode(&skill); err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "invalid json: %v"}`, err), http.StatusBadRequest)
			return
		}

		// If renaming, delete old file
		if skill.Name != "" && skill.Name != name {
			_ = os.Remove(skillPath)
			skillPath = filepath.Join(s.workspace, "skills", skill.Name+".yaml")
		}

		if err := os.WriteFile(skillPath, []byte(skill.Content), 0644); err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "failed to write file: %v"}`, err), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(skill)
		return
	}

	if r.Method == http.MethodDelete {
		if err := os.Remove(skillPath); err != nil && !os.IsNotExist(err) {
			http.Error(w, fmt.Sprintf(`{"error": "failed to delete: %v"}`, err), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status": "deleted"}`))
		return
	}

	http.Error(w, `{"error": "method not allowed"}`, http.StatusMethodNotAllowed)
}
