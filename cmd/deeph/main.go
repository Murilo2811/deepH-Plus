package main

import (
	"context"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"deeph/internal/runtime"
	"deeph/internal/scaffold"
)

func main() {
	if err := run(os.Args[1:]); err != nil {
		fmt.Fprintln(os.Stderr, "error:", err)
		os.Exit(1)
	}
}

func run(args []string) error {
	if len(args) == 0 {
		printUsage()
		return nil
	}

	switch args[0] {
	case "help", "-h", "--help":
		printUsage()
		return nil
	case "init":
		return cmdInit(args[1:])
	case "validate":
		return cmdValidate(args[1:])
	case "trace":
		return cmdTrace(args[1:])
	case "run":
		return cmdRun(args[1:])
	case "chat":
		return cmdChat(args[1:])
	case "session":
		return cmdSession(args[1:])
	case "crew":
		return cmdCrew(args[1:])
	case "skill":
		return cmdSkill(args[1:])
	case "agent":
		return cmdAgent(args[1:])
	case "provider":
		return cmdProvider(args[1:])
	case "kit":
		return cmdKit(args[1:])
	case "ui":
		return cmdUi(args[1:])
	case "coach":
		return cmdCoach(args[1:])
	case "command":
		return cmdCommand(args[1:])
	case "type":
		return cmdType(args[1:])
	default:
		return fmt.Errorf("unknown command %q", args[0])
	}
}

func printUsage() {
	fmt.Println("deepH - lightweight agent runtime in Go")
	fmt.Println("")
	fmt.Println("Usage:")
	fmt.Println("  deeph init [--workspace DIR]")
	fmt.Println("  deeph validate [--workspace DIR]")
	fmt.Println("  deeph ui [--workspace DIR] [--port N] [--no-browser]")
	fmt.Println(`  deeph trace [--workspace DIR] [--json] [--multiverse N] "<agent|a+b|a>b|a+b>c|@crew|crew:name>" [input]`)
	fmt.Println(`  deeph run [--workspace DIR] [--trace] [--coach=false] [--multiverse N] [--judge-agent SPEC] [--judge-max-output-chars N] "<agent|a+b|a>b|a+b>c|@crew|crew:name>" [input]`)
	fmt.Println(`  deeph chat [--workspace DIR] [--session ID] [--history-turns N] [--history-tokens N] [--trace] [--coach=false] "<agent|a+b|a>b|a+b>c>"`)
	fmt.Println("  deeph session list [--workspace DIR]")
	fmt.Println("  deeph session show [--workspace DIR] [--tail N] <id>")
	fmt.Println("  deeph crew list [--workspace DIR]")
	fmt.Println("  deeph crew show [--workspace DIR] <name>")
	fmt.Println("  deeph agent create [--workspace DIR] [--force] [--provider NAME] [--model MODEL] <name>")
	fmt.Println("  deeph provider list [--workspace DIR]")
	fmt.Println("  deeph provider add [--workspace DIR] [--name NAME] [--model MODEL] [--set-default] [--force] deepseek")
	fmt.Println("  deeph kit list [--workspace DIR]")
	fmt.Println("  deeph kit add [--workspace DIR] [--force] [--provider-name NAME] [--model MODEL] [--set-default-provider] [--skip-provider] <name|git-url[#manifest.yaml]>")
	fmt.Println("  deeph coach stats [--workspace DIR] [--top N] [--scope SPEC] [--kind KIND] [--json]")
	fmt.Println("  deeph coach reset [--workspace DIR] [--all] [--hints] [--transitions] [--commands] [--ports] --yes")
	fmt.Println("  deeph command list [--category CAT] [--json]")
	fmt.Println(`  deeph command explain [--json] "<command path>"`)
	fmt.Println("  deeph skill list")
	fmt.Println("  deeph skill add [--workspace DIR] [--force] <name>")
	fmt.Println("  deeph type list [--category CAT] [--json]")
	fmt.Println("  deeph type explain [--json] <kind|alias>")
}

func cmdInit(args []string) error {
	fs := flag.NewFlagSet("init", flag.ContinueOnError)
	workspace := fs.String("workspace", ".", "workspace path")
	if err := fs.Parse(args); err != nil {
		return err
	}
	abs, _ := filepath.Abs(*workspace)
	if err := scaffold.InitWorkspace(abs); err != nil {
		return err
	}
	fmt.Printf("Initialized deepH workspace at %s\n", abs)
	fmt.Println("Next steps:")
	fmt.Println("  1. deeph skill list")
	fmt.Println("  2. deeph skill add echo")
	fmt.Println("  3. cp examples/agents/guide.yaml agents/guide.yaml   (optional guide)")
	fmt.Println("  4. cp examples/crews/reviewpack.yaml crews/reviewpack.yaml   (optional multiverse crew)")
	fmt.Println("  5. deeph kit list   (optional prebuilt starter kits)")
	fmt.Println("  6. or create your own agents/*.yaml")
	fmt.Println("  7. deeph validate")
	return nil
}

func cmdValidate(args []string) error {
	fs := flag.NewFlagSet("validate", flag.ContinueOnError)
	workspace := fs.String("workspace", ".", "workspace path")
	if err := fs.Parse(args); err != nil {
		return err
	}
	p, abs, verr, err := loadAndValidate(*workspace)
	if err != nil {
		return err
	}
	printValidation(verr)
	if verr != nil && verr.HasErrors() {
		return verr
	}
	fmt.Printf("Validation OK (%d agent(s), %d skill(s), %d provider(s)) in %s\n", len(p.Agents), len(p.Skills), len(p.Root.Providers), abs)
	return nil
}

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
		recordCoachCommandTransition(abs, "trace", resolvedSpec)
		branches, mvPlan, err := traceMultiverse(context.Background(), abs, p, universes)
		if err != nil {
			return err
		}
		if *jsonOut {
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
	agentSpec := resolvedSpec
	plan, _, err := eng.PlanSpec(context.Background(), agentSpec, input)
	if err != nil {
		return err
	}
	recordCoachCommandTransition(abs, "trace", agentSpec)
	if *jsonOut {
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
	fmt.Printf("Trace (%s)\n", abs)
	fmt.Printf("  created_at: %s\n", plan.CreatedAt.Format(time.RFC3339))
	fmt.Printf("  parallel: %v\n", plan.Parallel)
	fmt.Println("  scheduler: dag_channels (dependency-driven, selective stage wait)")
	if strings.TrimSpace(plan.Spec) != "" {
		fmt.Printf("  spec: %q\n", plan.Spec)
	}
	fmt.Printf("  input: %q\n", plan.Input)
	if len(plan.Stages) > 1 {
		for _, s := range plan.Stages {
			fmt.Printf("  stage[%d]: agents=%v\n", s.Index, s.Agents)
		}
		if len(plan.Handoffs) > 0 {
			fmt.Println("  handoffs:")
			for _, h := range plan.Handoffs {
				req := ""
				if h.Required {
					req = " required=true"
				}
				ch := ""
				if strings.TrimSpace(h.Channel) != "" {
					ch = " channel=" + h.Channel
				}
				merge := ""
				if strings.TrimSpace(h.MergePolicy) != "" && h.MergePolicy != "auto" {
					merge = " merge=" + h.MergePolicy
				}
				chPrio := ""
				if h.ChannelPriority > 0 {
					chPrio = fmt.Sprintf(" channel_priority=%.2f", h.ChannelPriority)
				}
				maxTok := ""
				if h.TargetMaxTokens > 0 {
					maxTok = fmt.Sprintf(" max_tokens=%d", h.TargetMaxTokens)
				}
				fmt.Printf("    - %s.%s -> %s.%s kind=%s%s%s%s%s%s\n", h.FromAgent, h.FromPort, h.ToAgent, h.ToPort, h.Kind, ch, merge, chPrio, maxTok, req)
			}
		}
	}
	for i, t := range plan.Tasks {
		fmt.Printf("  task[%d]: stage=%d agent=%s provider=%s(%s) model=%s skills=%v startup_calls=%d context_budget=%dt context_moment=%s\n", i, t.StageIndex, t.Agent, t.Provider, t.ProviderType, t.Model, t.Skills, t.StartupCalls, t.ContextBudget, t.ContextMoment)
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
	return nil
}














