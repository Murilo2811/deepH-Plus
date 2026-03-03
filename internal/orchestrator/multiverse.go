package orchestrator

import (
	"context"
	"fmt"
	"sort"
	"strings"
	"sync"
	"time"

	"deeph/internal/project"
	"deeph/internal/runtime"
	"deeph/internal/typesys"
)

type UniverseState struct {
	Config    project.UniverseConfig
	ID        string
	Label     string
	Input     string
	InputNote string
	Index     int
	Source    string
}

type Handoff struct {
	FromID      string
	FromLabel   string
	FromPort    string
	ToID        string
	ToLabel     string
	ToPort      string
	Kind        string
	Channel     string
	MergePolicy string
	MaxChars    int
	FromIndex   int
	ToIndex     int
}

type Plan struct {
	Universes  []UniverseState
	Handoffs   []Handoff
	Scheduler  string
	incoming   [][]Handoff
	dependents [][]int
	indegree   []int
}

type RunBranch struct {
	Universe              UniverseState
	DurationMS            int64
	Error                 string
	Report                runtime.ExecutionReport
	IncomingChannels      []string
	IncomingContributions int
	InputAugmented        bool
	InputAugmentNote      string
}

// Callbacks for SSE streaming
type Callbacks struct {
	OnStart    func(idx int, u UniverseState)
	OnComplete func(idx int, br RunBranch)
}

func PlanExecution(universes []UniverseState) (*Plan, error) {
	n := len(universes)
	mv := &Plan{
		Universes:  universes,
		Scheduler:  "parallel",
		incoming:   make([][]Handoff, n),
		dependents: make([][]int, n),
		indegree:   make([]int, n),
	}
	if n == 0 {
		return mv, nil
	}
	byRef := make(map[string]int, n*2)
	for i, u := range universes {
		if strings.TrimSpace(u.ID) == "" {
			return nil, fmt.Errorf("universe[%d] missing id", i)
		}
		if _, ok := byRef[strings.ToLower(u.ID)]; ok {
			return nil, fmt.Errorf("duplicate universe id %q", u.ID)
		}
		byRef[strings.ToLower(u.ID)] = i
		if lbl := strings.TrimSpace(u.Label); lbl != "" {
			k := strings.ToLower(lbl)
			if j, ok := byRef[k]; ok && j != i {
				return nil, fmt.Errorf("duplicate universe label %q", lbl)
			}
			byRef[k] = i
		}
	}
	seenEdge := map[string]struct{}{}
	for toIdx, u := range universes {
		if len(u.Config.DependsOn) == 0 {
			continue
		}
		mv.Scheduler = "dag_channels"
		for _, ref := range u.Config.DependsOn {
			fromIdx, ok := byRef[strings.ToLower(ref)]
			if !ok {
				return nil, fmt.Errorf("universe %q depends_on unknown %q", u.ID, ref)
			}
			if fromIdx == toIdx {
				return nil, fmt.Errorf("universe %q cannot depend on itself", u.ID)
			}
			edgeKey := fmt.Sprintf("%d->%d", fromIdx, toIdx)
			if _, ok := seenEdge[edgeKey]; ok {
				continue
			}
			seenEdge[edgeKey] = struct{}{}
			from := universes[fromIdx]
			kind := strings.TrimSpace(from.Config.OutputKind)
			if kind == "" {
				kind = string(typesys.KindSummaryText)
			}
			inPort := u.Config.InputPort
			if inPort == "" {
				inPort = "context"
			}
			outPort := from.Config.OutputPort
			if outPort == "" {
				outPort = "result"
			}
			h := Handoff{
				FromID:      from.ID,
				FromLabel:   from.Label,
				FromPort:    outPort,
				ToID:        u.ID,
				ToLabel:     u.Label,
				ToPort:      inPort,
				Kind:        kind,
				Channel:     fmt.Sprintf("%s.%s->%s.%s#%s", from.ID, outPort, u.ID, inPort, kind),
				MergePolicy: u.Config.MergePolicy,
				MaxChars:    u.Config.HandoffMaxChars,
				FromIndex:   fromIdx,
				ToIndex:     toIdx,
			}
			mv.Handoffs = append(mv.Handoffs, h)
			mv.incoming[toIdx] = append(mv.incoming[toIdx], h)
			mv.dependents[fromIdx] = append(mv.dependents[fromIdx], toIdx)
			mv.indegree[toIdx]++
		}
	}
	// Kahn's algorithm
	ind := append([]int(nil), mv.indegree...)
	q := make([]int, 0, n)
	for i := 0; i < n; i++ {
		if ind[i] == 0 {
			q = append(q, i)
		}
	}
	visited := 0
	for len(q) > 0 {
		i := q[0]
		q = q[1:]
		visited++
		for _, j := range mv.dependents[i] {
			ind[j]--
			if ind[j] == 0 {
				q = append(q, j)
			}
		}
	}
	if visited != n {
		return nil, fmt.Errorf("dependency cycle detected")
	}
	return mv, nil
}

func RunDAG(ctx context.Context, workspace string, p *project.Project, universes []UniverseState, callbacks Callbacks) ([]RunBranch, *Plan, error) {
	mvPlan, err := PlanExecution(universes)
	if err != nil {
		return nil, nil, err
	}
	out := make([]RunBranch, len(universes))
	if len(universes) == 0 {
		return out, mvPlan, nil
	}

	type mvDone struct {
		idx    int
		branch RunBranch
	}
	doneCh := make(chan mvDone, len(universes))
	started := make([]bool, len(universes))
	done := make([]bool, len(universes))
	remaining := append([]int(nil), mvPlan.indegree...)
	var mu sync.Mutex

	startUniverse := func(i int) {
		if started[i] {
			return
		}
		started[i] = true
		u := universes[i]
		if callbacks.OnStart != nil {
			callbacks.OnStart(i, u)
		}
		mu.Lock()
		completed := make([]RunBranch, len(out))
		copy(completed, out)
		completedDone := make([]bool, len(done))
		copy(completedDone, done)
		mu.Unlock()

		go func(i int, u UniverseState, snapshot []RunBranch, snapshotDone []bool) {
			start := time.Now()
			br := RunBranch{Universe: u}
			input, note, chans, contribs := buildUniverseInput(u, mvPlan, snapshotDone, snapshot)
			if note != "" {
				br.InputAugmentNote = note
			}
			br.IncomingChannels = chans
			br.IncomingContributions = contribs
			br.InputAugmented = len(chans) > 0

			eng, err := runtime.New(workspace, p)
			if err != nil {
				br.Error = err.Error()
				br.DurationMS = time.Since(start).Milliseconds()
				if callbacks.OnComplete != nil {
					callbacks.OnComplete(i, br)
				}
				doneCh <- mvDone{idx: i, branch: br}
				return
			}
			report, err := eng.RunSpec(ctx, u.Config.Spec, input)
			br.DurationMS = time.Since(start).Milliseconds()
			if err != nil {
				br.Error = err.Error()
			} else {
				br.Report = report
			}
			if callbacks.OnComplete != nil {
				callbacks.OnComplete(i, br)
			}
			doneCh <- mvDone{idx: i, branch: br}
		}(i, u, completed, completedDone)
	}

	for i := range universes {
		if remaining[i] == 0 {
			startUniverse(i)
		}
	}
	completedCount := 0
	for completedCount < len(universes) {
		select {
		case <-ctx.Done():
			return nil, mvPlan, ctx.Err()
		case res := <-doneCh:
			mu.Lock()
			out[res.idx] = res.branch
			if !done[res.idx] {
				done[res.idx] = true
				completedCount++
			}
			next := append([]int(nil), mvPlan.dependents[res.idx]...)
			ready := make([]int, 0, len(next))
			for _, j := range next {
				if remaining[j] > 0 {
					remaining[j]--
				}
				if remaining[j] == 0 && !started[j] {
					ready = append(ready, j)
				}
			}
			mu.Unlock()
			for _, j := range ready {
				startUniverse(j)
			}
		}
	}
	sort.Slice(out, func(i, j int) bool { return out[i].Universe.Index < out[j].Universe.Index })
	return out, mvPlan, nil
}

func buildUniverseInput(u UniverseState, mvPlan *Plan, done []bool, branches []RunBranch) (string, string, []string, int) {
	base := strings.TrimSpace(u.Input)
	if u.Config.InputPrefix != "" {
		base = u.Config.InputPrefix + "\n\n" + base
	}
	if u.Config.InputSuffix != "" {
		base = base + "\n\n" + u.Config.InputSuffix
	}
	base = strings.TrimSpace(base)

	if mvPlan == nil {
		return base, "", nil, 0
	}
	in := mvPlan.incoming[u.Index]
	if len(in) == 0 {
		return base, "", nil, 0
	}
	selected := make([]Handoff, 0, len(in))
	switch u.Config.MergePolicy {
	case "latest":
		for i := len(in) - 1; i >= 0; i-- {
			h := in[i]
			if done == nil || (h.FromIndex >= 0 && h.FromIndex < len(done) && done[h.FromIndex]) {
				selected = append(selected, h)
				break
			}
		}
	default: // append
		for _, h := range in {
			if done == nil || (h.FromIndex >= 0 && h.FromIndex < len(done) && done[h.FromIndex]) {
				selected = append(selected, h)
			}
		}
	}
	if len(selected) == 0 || len(branches) == 0 {
		return base, "", nil, 0
	}
	lines := []string{
		"[multiverse_handoffs]",
		"kind: context/compiled",
		fmt.Sprintf("target: %s", u.ID),
	}
	channels := make([]string, 0, len(selected))
	contribs := 0
	for _, h := range selected {
		if h.FromIndex < 0 || h.FromIndex >= len(branches) {
			continue
		}
		br := branches[h.FromIndex]
		if strings.TrimSpace(br.Universe.ID) == "" {
			continue
		}
		channels = append(channels, h.Channel)
		contribs++
		lines = append(lines, "- channel: "+h.Channel)
		lines = append(lines, "  kind: "+h.Kind)
		lines = append(lines, "  from: \""+br.Universe.ID+"\"")
		if br.Error != "" {
			lines = append(lines, "  status: error")
			lines = append(lines, "  error: \""+br.Error+"\"")
			continue
		}
		lines = append(lines, "  status: ok")

		// To keep dependencies clean without importing cmd/deeph formatters,
		// we just take the summary of the last result.
		sinks := extractSinks(br.Report)
		lines = append(lines, "  sink_outputs:")
		if len(sinks) == 0 {
			lines = append(lines, "    - agent: none")
			lines = append(lines, "      text: \"\"")
			continue
		}
		for _, s := range sinks {
			lines = append(lines, "    - agent: "+s.Agent)
			if s.Error != "" {
				lines = append(lines, "      error: \""+s.Error+"\"")
				continue
			}
			text := s.Text
			if h.MaxChars > 0 && len(text) > h.MaxChars {
				text = text[:h.MaxChars] + "... (truncated)"
			}
			lines = append(lines, "      text: |")
			for _, ln := range strings.Split(text, "\n") {
				lines = append(lines, "        "+ln)
			}
		}
	}
	if contribs == 0 {
		return base, "", nil, 0
	}
	compiled := strings.Join(lines, "\n")
	combined := compiled
	if base != "" {
		combined = base + "\n\n" + compiled
	}
	note := fmt.Sprintf("multiverse channels=%d merge=%s", len(channels), u.Config.MergePolicy)
	return combined, note, channels, contribs
}

type sinkItem struct {
	Agent string
	Text  string
	Error string
}

func extractSinks(report runtime.ExecutionReport) []sinkItem {
	var out []sinkItem
	for _, res := range report.Results {
		if res.Error != "" {
			out = append(out, sinkItem{Agent: res.Agent, Error: res.Error})
		} else {
			out = append(out, sinkItem{Agent: res.Agent, Text: res.Output})
		}
	}
	return out
}
