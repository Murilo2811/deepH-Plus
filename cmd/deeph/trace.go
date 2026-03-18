package main

import (
	"context"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"os"
	"strings"
	"time"

	"deeph/internal/runtime"
)

func cmdTrace(args []string) error {
	fs := flag.NewFlagSet("trace", flag.ContinueOnError)
	workspace := fs.String("workspace", ".", "workspace path")
	jsonOut := fs.Bool("json", false, "print execution plan trace as JSON")
	multiverse := fs.Int("multiverse", 1, "number of universes to trace (0 = all crew universes)")
	if err := fs.Parse(args); err != nil {
		return err
	}
	rest := fs.Args()
	if len(rest) == 0 {
		return errors.New("trace requires <agent|a+b|@crew|crew:name>")
	}
	agentSpecArg := rest[0]
	input := strings.Join(rest[1:], " ")

	p, abs, verr, err := loadAndValidate(*workspace)
	if err != nil {
		return err
	}
	printValidation(verr)
	if verr != nil && verr.HasErrors() {
		return verr
	}
	eng, err := runtime.New(abs, p)
	if err != nil {
		return err
	}
	resolvedSpec, crew, err := resolveAgentSpecOrCrew(abs, agentSpecArg)
	if err != nil {
		return err
	}
	universes, err := buildMultiverseUniverses(abs, agentSpecArg, resolvedSpec, input, *multiverse, crew)
	if err != nil {
		return err
	}

	if len(universes) > 1 {
		return traceMultiverseOutput(abs, agentSpecArg, resolvedSpec, universes, *jsonOut)
	}

	return traceSingleOutput(abs, agentSpecArg, resolvedSpec, eng, input, *jsonOut)
}

func traceMultiverseOutput(abs, agentSpecArg, resolvedSpec string, universes []multiverseUniverse, jsonOut bool) error {
	// Re-load project for multiverse tracing
	proj, _, _, err := loadAndValidate(abs)
	if err != nil {
		return err
	}
	recordCoachCommandTransition(abs, "trace", resolvedSpec)
	branches, mvPlan, err := traceMultiverse(context.Background(), abs, proj, universes)
	if err != nil {
		return err
	}
	if jsonOut {
		payload := struct {
			Workspace        string                      `json:"workspace"`
			Scheduler        string                      `json:"scheduler"`
			Source           string                      `json:"source"`
			UniverseHandoffs []multiverseUniverseHandoff `json:"universe_handoffs,omitempty"`
			Branches         []multiverseTraceBranch     `json:"branches"`
		}{
			Workspace:        abs,
			Scheduler:        mvPlan.Scheduler,
			Source:           agentSpecArg,
			UniverseHandoffs: mvPlan.Handoffs,
			Branches:         branches,
		}
		enc := json.NewEncoder(os.Stdout)
		enc.SetIndent("", "  ")
		return enc.Encode(payload)
	}
	printMultiverseTraceText(abs, agentSpecArg, mvPlan, branches)
	return nil
}

func traceSingleOutput(abs, agentSpecArg, agentSpec string, eng *runtime.Engine, input string, jsonOut bool) error {
	plan, _, err := eng.PlanSpec(context.Background(), agentSpec, input)
	if err != nil {
		return err
	}
	recordCoachCommandTransition(abs, "trace", agentSpec)
	if jsonOut {
		payload := struct {
			Workspace string                `json:"workspace"`
			Scheduler string                `json:"scheduler"`
			Plan      runtime.ExecutionPlan `json:"plan"`
		}{
			Workspace: abs,
			Scheduler: "dag_channels",
			Plan:      plan,
		}
		enc := json.NewEncoder(os.Stdout)
		enc.SetIndent("", "  ")
		return enc.Encode(payload)
	}
	printTraceSummary(abs, plan)
	return nil
}

func printTraceSummary(abs string, plan runtime.ExecutionPlan) {
	fmt.Printf("Trace (%s)\n", abs)
	fmt.Printf("  created_at: %s\n", plan.CreatedAt.Format(time.RFC3339))
	fmt.Printf("  parallel: %v\n", plan.Parallel)
	fmt.Println("  scheduler: dag_channels (dependency-driven, selective stage wait)")
	if strings.TrimSpace(plan.Spec) != "" {
		fmt.Printf("  spec: %q\n", plan.Spec)
	}
	fmt.Printf("  input: %q\n", plan.Input)

	if len(plan.Stages) > 1 {
		printStagesAndHandoffs(plan)
	}

	printTasks(plan)
}

func printStagesAndHandoffs(plan runtime.ExecutionPlan) {
	for _, s := range plan.Stages {
		fmt.Printf("  stage[%d]: agents=%v\n", s.Index, s.Agents)
	}
	if len(plan.Handoffs) > 0 {
		fmt.Println("  handoffs:")
		for _, h := range plan.Handoffs {
			printHandoff(h)
		}
	}
}

func printHandoff(h runtime.TypedHandoffPlan) {
	var parts []string
	if h.Required {
		parts = append(parts, "required=true")
	}
	if ch := strings.TrimSpace(h.Channel); ch != "" {
		parts = append(parts, "channel="+ch)
	}
	if h.MergePolicy != "" && h.MergePolicy != "auto" {
		parts = append(parts, "merge="+h.MergePolicy)
	}
	if h.ChannelPriority > 0 {
		parts = append(parts, fmt.Sprintf("channel_priority=%.2f", h.ChannelPriority))
	}
	if h.TargetMaxTokens > 0 {
		parts = append(parts, fmt.Sprintf("max_tokens=%d", h.TargetMaxTokens))
	}

	suffix := ""
	if len(parts) > 0 {
		suffix = " " + strings.Join(parts, " ")
	}
	fmt.Printf("    - %s.%s -> %s.%s kind=%s%s\n", h.FromAgent, h.FromPort, h.ToAgent, h.ToPort, h.Kind, suffix)
}

func printTasks(plan runtime.ExecutionPlan) {
	for i, t := range plan.Tasks {
		fmt.Printf("  task[%d]: stage=%d agent=%s provider=%s(%s) model=%s skills=%v startup_calls=%d context_budget=%dt context_moment=%s\n",
			i, t.StageIndex, t.Agent, t.Provider, t.ProviderType, t.Model, t.Skills, t.StartupCalls, t.ContextBudget, t.ContextMoment)
		if len(t.DependsOn) > 0 {
			fmt.Printf("           depends_on=%v\n", t.DependsOn)
		}
		if len(t.IO.Inputs) > 0 || len(t.IO.Outputs) > 0 {
			fmt.Printf("           io.inputs=%d io.outputs=%d\n", len(t.IO.Inputs), len(t.IO.Outputs))
			for _, in := range t.IO.Inputs {
				if (in.MergePolicy != "" && in.MergePolicy != "auto") || in.ChannelPriority > 0 || in.MaxTokens > 0 {
					fmt.Printf("           input[%s] kinds=%v", in.Name, in.Kinds)
					if in.MergePolicy != "" && in.MergePolicy != "auto" {
						fmt.Printf(" merge=%s", in.MergePolicy)
					}
					if in.ChannelPriority > 0 {
						fmt.Printf(" channel_priority=%.2f", in.ChannelPriority)
					}
					if in.MaxTokens > 0 {
						fmt.Printf(" max_tokens=%d", in.MaxTokens)
					}
					fmt.Println()
				}
			}
		}
		if t.ProviderType == "deepseek" && len(t.Skills) > 0 {
			fmt.Println("           tool_loop=enabled (deepseek chat completions -> skills)")
		}
		if t.AgentFile != "" {
			fmt.Printf("           source=%s\n", t.AgentFile)
		}
	}
}
