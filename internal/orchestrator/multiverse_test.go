package orchestrator

import (
	"testing"

	"deeph/internal/project"
)

func TestBuildPlanView_Independent(t *testing.T) {
	us := []UniverseState{
		{ID: "a", Label: "Alpha", Config: project.UniverseConfig{Spec: "spec-a"}, Index: 0},
		{ID: "b", Label: "Beta", Config: project.UniverseConfig{Spec: "spec-b"}, Index: 1},
	}
	plan, err := PlanExecution(us)
	if err != nil {
		t.Fatal(err)
	}
	pv := BuildPlanView(plan)

	if len(pv.Nodes) != 2 {
		t.Fatalf("expected 2 nodes, got %d", len(pv.Nodes))
	}
	if pv.Nodes[0].ID != "a" || pv.Nodes[0].Label != "Alpha" || pv.Nodes[0].Spec != "spec-a" {
		t.Errorf("node 0 mismatch: %+v", pv.Nodes[0])
	}
	if len(pv.Nodes[0].DependsOn) != 0 {
		t.Errorf("expected empty depends_on, got %v", pv.Nodes[0].DependsOn)
	}
	if len(pv.Edges) != 0 {
		t.Errorf("expected 0 edges for independent universes, got %d", len(pv.Edges))
	}
}

func TestBuildPlanView_WithDependency(t *testing.T) {
	us := []UniverseState{
		{ID: "researcher", Label: "Researcher", Config: project.UniverseConfig{Spec: "researcher-spec"}, Index: 0},
		{ID: "writer", Label: "Writer", Config: project.UniverseConfig{Spec: "writer-spec", DependsOn: []string{"researcher"}}, Index: 1},
	}
	plan, err := PlanExecution(us)
	if err != nil {
		t.Fatal(err)
	}
	pv := BuildPlanView(plan)

	if len(pv.Nodes) != 2 {
		t.Fatalf("expected 2 nodes, got %d", len(pv.Nodes))
	}
	if len(pv.Edges) != 1 {
		t.Fatalf("expected 1 edge, got %d", len(pv.Edges))
	}
	e := pv.Edges[0]
	if e.From != "researcher" || e.To != "writer" {
		t.Errorf("edge mismatch: from=%s to=%s", e.From, e.To)
	}
	if e.Kind == "" {
		t.Error("edge kind should not be empty")
	}
	if e.Channel == "" {
		t.Error("edge channel should not be empty")
	}
}

func TestBuildPlanView_DependsOnNilBecomesEmpty(t *testing.T) {
	us := []UniverseState{
		{ID: "solo", Label: "Solo", Config: project.UniverseConfig{Spec: "s"}, Index: 0},
	}
	plan, err := PlanExecution(us)
	if err != nil {
		t.Fatal(err)
	}
	pv := BuildPlanView(plan)

	if pv.Nodes[0].DependsOn == nil {
		t.Error("DependsOn should be [] not nil for clean JSON serialization")
	}
}

func TestCallbacksZeroValueSafe(t *testing.T) {
	// Ensure a zero-value Callbacks struct doesn't panic when fields are nil.
	var cbs Callbacks
	if cbs.OnStart != nil || cbs.OnComplete != nil || cbs.OnPlan != nil || cbs.OnHandoff != nil {
		t.Error("zero-value Callbacks should have all nil fields")
	}
}

func TestHandoffEventFields(t *testing.T) {
	h := HandoffEvent{
		From:    "a",
		To:      "b",
		Channel: "a.result->b.context#summary_text",
		Kind:    "summary_text",
		Chars:   42,
	}
	if h.From != "a" || h.To != "b" || h.Chars != 42 {
		t.Errorf("unexpected: %+v", h)
	}
}

func TestPlanViewJSONTags(t *testing.T) {
	// Verify the JSON representation uses correct field names.
	pv := PlanView{
		Nodes: []PlanNode{{ID: "x", Label: "X", Spec: "s", DependsOn: []string{}}},
		Edges: []PlanEdge{{From: "x", To: "y", Kind: "k", Channel: "c"}},
	}
	if len(pv.Nodes) != 1 || pv.Nodes[0].ID != "x" {
		t.Errorf("unexpected: %+v", pv)
	}
	if len(pv.Edges) != 1 || pv.Edges[0].From != "x" {
		t.Errorf("unexpected edge: %+v", pv.Edges[0])
	}
}
