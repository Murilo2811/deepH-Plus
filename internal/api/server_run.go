package api

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"deeph/internal/project"
	"deeph/internal/runtime"
)

type runRequest struct {
	Agents []string `json:"agents"`
	Mode   string   `json:"mode"` // "sequential" | "parallel"
	Task   string   `json:"task"`
}

func (s *Server) handleRun(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"error": "method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req runRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "invalid json: %v"}`, err), http.StatusBadRequest)
		return
	}
	if len(req.Agents) == 0 {
		http.Error(w, `{"error": "at least one agent is required"}`, http.StatusBadRequest)
		return
	}
	if strings.TrimSpace(req.Task) == "" {
		http.Error(w, `{"error": "task is required"}`, http.StatusBadRequest)
		return
	}

	p, err := project.Load(s.workspace)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
		return
	}

	eng, err := runtime.New(s.workspace, p)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "runtime: %v"}`, err), http.StatusInternalServerError)
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

	ctx := context.Background()

	if req.Mode == "parallel" {
		// Parallel: launch all agents concurrently, pipe results as they arrive
		type agentResult struct {
			agent  string
			output string
			err    error
		}
		ch := make(chan agentResult, len(req.Agents))
		for _, agentName := range req.Agents {
			go func(name string) {
				report, err := eng.RunSpec(ctx, name, req.Task)
				if err != nil {
					ch <- agentResult{agent: name, err: err}
					return
				}
				var out string
				for i := len(report.Results) - 1; i >= 0; i-- {
					if report.Results[i].Output != "" {
						out = report.Results[i].Output
						break
					}
				}
				ch <- agentResult{agent: name, output: out}
			}(agentName)
		}

		for range req.Agents {
			res := <-ch
			if res.err != nil {
				sendEvent("agent_error", map[string]string{"agent": res.agent, "error": res.err.Error()})
			} else {
				sendEvent("agent_result", map[string]any{"agent": res.agent, "text": res.output})
			}
		}
	} else {
		// Sequential: run agents one by one; output of previous is appended to input of next
		taskInput := req.Task
		for _, agentName := range req.Agents {
			sendEvent("agent_start", map[string]string{"agent": agentName})
			report, err := eng.RunSpec(ctx, agentName, taskInput)
			if err != nil {
				sendEvent("agent_error", map[string]string{"agent": agentName, "error": err.Error()})
				break
			}

			var out string
			for i := len(report.Results) - 1; i >= 0; i-- {
				if report.Results[i].Output != "" {
					out = report.Results[i].Output
					break
				}
			}
			sendEvent("agent_result", map[string]any{"agent": agentName, "text": out})
			// Feed result into the next agent's input
			if out != "" {
				taskInput = out
			}
		}
	}

	sendEvent("done", map[string]string{"status": "ok"})
}
