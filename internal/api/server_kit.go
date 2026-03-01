package api

import (
	"encoding/json"
	"fmt"
	"net/http"

	"deeph/internal/catalog"
	"deeph/internal/project"
)

type kitResponseItem struct {
	Name         string `json:"name"`
	Description  string `json:"description"`
	ProviderType string `json:"provider_type"`
	SkillsCount  int    `json:"skills_count"`
	FilesCount   int    `json:"files_count"`
}

func (s *Server) handleKitList(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, `{"error": "method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	kits := catalog.ListKits()
	out := make([]kitResponseItem, len(kits))
	for i, k := range kits {
		out[i] = kitResponseItem{
			Name:         k.Name,
			Description:  k.Description,
			ProviderType: k.ProviderType,
			SkillsCount:  len(k.RequiredSkills),
			FilesCount:   len(k.Files),
		}
	}

	json.NewEncoder(w).Encode(out)
}

func (s *Server) handleKitInstall(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"error": "method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	var req struct {
		KitName            string `json:"kit_name"`
		Force              bool   `json:"force"`
		SkipProvider       bool   `json:"skip_provider"`
		SetDefaultProvider bool   `json:"set_default_provider"`
		ProviderName       string `json:"provider_name"`
		Model              string `json:"model"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "invalid json: %v"}`, err), http.StatusBadRequest)
		return
	}

	kit, err := catalog.GetKit(req.KitName)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusNotFound)
		return
	}

	// Default fallback for optional configs
	if req.ProviderName == "" {
		req.ProviderName = "deepseek"
	}
	if req.Model == "" {
		req.Model = "deepseek-chat"
	}

	res, err := project.InstallKit(s.workspace, kit, req.Force, req.SkipProvider, req.SetDefaultProvider, req.ProviderName, req.Model)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "install failed: %v"}`, err), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": fmt.Sprintf("Kit %s installed successfully", res.KitName),
		"stats":   res,
	})
}
