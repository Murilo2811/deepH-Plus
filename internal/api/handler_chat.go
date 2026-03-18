package api

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"deeph/internal/project"
	"deeph/internal/runtime"
)

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

	input := buildChatTurnInput(meta, entries, req.Message, 8)

	ctx := context.Background()
	report, err := eng.RunSpec(ctx, meta.AgentSpec, input)
	if err != nil {
		sendEvent("error", map[string]string{"error": err.Error()})
		return
	}

	var finalOutput string
	var finalError string
	finalAgent := meta.AgentSpec

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

func buildChatTurnInput(meta *chatSessionMeta, entries []chatSessionEntry, userMessage string, maxTurns int) string {
	lines := []string{"[chat_session]", "session_id: " + meta.ID, "history:"}

	start := 0
	if len(entries) > maxTurns*2 {
		start = len(entries) - maxTurns*2
	}
	for _, e := range entries[start:] {
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
