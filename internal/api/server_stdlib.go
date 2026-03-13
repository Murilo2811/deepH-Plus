package api

import (
	"encoding/json"
	"net/http"

	"deeph/internal/catalog"
)

type stdlibResponse struct {
	Agents []catalog.StandardAsset `json:"agents"`
	Crews  []catalog.StandardAsset `json:"crews"`
	Skills []catalog.SkillTemplate `json:"skills"`
}

func (s *Server) handleStandardLibrary(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, `{"error": "method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	resp := stdlibResponse{
		Agents: catalog.StandardAgents(),
		Crews:  catalog.StandardCrews(),
		Skills: catalog.List(),
	}

	json.NewEncoder(w).Encode(resp)
}
