package main

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"strings"
	"time"

	"deeph/internal/runtime"
)

func cmdRun(args []string) error {
	fs := flag.NewFlagSet("run", flag.ContinueOnError)
	workspace := fs.String("workspace", ".", "workspace path")
	showTrace := fs.Bool("trace", false, "print execution trace summary")
	showCoach := fs.Bool("coach", true, "show occasional semantic tips while waiting")
	multiverse := fs.Int("multiverse", 1, "number of universes to run (0 = all crew universes)")
	judgeAgent := fs.String("judge-agent", "", "agent spec (or @crew) used to compare multiverse branches and recommend a result")
	judgeMaxOutputChars := fs.Int("judge-max-output-chars", 700, "max chars per branch sink output sent to the judge agent")
	if err := fs.Parse(args); err != nil {
		return err
	}
	rest := fs.Args()
	if len(rest) == 0 {
		return errors.New("run requires <agent|a+b|@crew|crew:name>")
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
	ctx := context.Background()
	universes, err := buildMultiverseUniverses(abs, agentSpecArg, resolvedSpec, input, *multiverse, crew)
	if err != nil {
		return err
	}
	if len(universes) > 1 {
		// Plan the first universe for coach heuristics and trace summary.
		plan, tasks, err := eng.PlanSpec(ctx, universes[0].Spec, universes[0].Input)
		if err != nil {
			return err
		}
		recordCoachCommandTransition(abs, "run", universes[0].Spec)
		stopCoach := func() {}
		if *showCoach {
			stopCoach = startCoachHint(ctx, coachHintRequest{
				Workspace:   abs,
				CommandPath: "run",
				AgentSpec:   universes[0].Spec,
				Input:       universes[0].Input,
				Plan:        &plan,
				Tasks:       tasks,
				ShowTrace:   *showTrace,
			})
		}
		branches, mvPlan, err := runMultiverse(ctx, abs, p, universes)
		if err != nil {
			return err
		}
		stopCoach()
		printMultiverseRunText(abs, agentSpecArg, mvPlan, branches)
		if strings.TrimSpace(*judgeAgent) != "" {
			judgeSpec, _, jerr := resolveAgentSpecOrCrew(abs, strings.TrimSpace(*judgeAgent))
			judge := multiverseJudgeRun{}
			if jerr != nil {
				judge = multiverseJudgeRun{Spec: strings.TrimSpace(*judgeAgent), Error: jerr.Error()}
			} else {
				judge = runMultiverseJudge(ctx, abs, p, judgeSpec, agentSpecArg, input, branches, *judgeMaxOutputChars)
			}
			printMultiverseJudgeText(judge)
		}
		// Feed coach with branch reports for post-run hints and learning.
		for _, b := range branches {
			if b.Error == "" {
				branchPlan, _, perr := eng.PlanSpec(ctx, b.Universe.Spec, b.Universe.Input)
				if perr == nil {
					recordCoachRunSignals(abs, &branchPlan, b.Report)
					if *showCoach {
						maybePrintCoachPostRunHint(abs, "run", &branchPlan, b.Report)
					}
				}
			}
		}
		if *showTrace {
			fmt.Printf("Trace summary: multiverse_branches=%d source=%q scheduler=%s\n", len(branches), agentSpecArg, mvPlan.Scheduler)
		}
		return nil
	}
	agentSpec := resolvedSpec
	plan, tasks, err := eng.PlanSpec(ctx, agentSpec, input)
	if err != nil {
		return err
	}
	recordCoachCommandTransition(abs, "run", agentSpec)
	stopCoach := func() {}
	if *showCoach {
		stopCoach = startCoachHint(ctx, coachHintRequest{
			Workspace:   abs,
			CommandPath: "run",
			AgentSpec:   agentSpec,
			Input:       input,
			Plan:        &plan,
			Tasks:       tasks,
			ShowTrace:   *showTrace,
		})
	}
	report, err := eng.RunSpec(ctx, agentSpec, input)
	stopCoach()
	if err != nil {
		return err
	}
	recordCoachRunSignals(abs, &plan, report)
	fmt.Printf("Run started=%s parallel=%v scheduler=dag_channels input=%q\n", report.StartedAt.Format(time.RFC3339), report.Parallel, report.Input)
	for _, r := range report.Results {
		fmt.Printf("\n[%s] stage=%d provider=%s(%s) model=%s duration=%s context=%d/%dt dropped=%d version=%d moment=%s\n", r.Agent, r.StageIndex, r.Provider, r.ProviderType, r.Model, r.Duration.Round(time.Millisecond), r.ContextTokens, r.ContextBudget, r.ContextDropped, r.ContextVersion, r.ContextMoment)
		if len(r.DependsOn) > 0 {
			fmt.Printf("  depends_on=%v\n", r.DependsOn)
		}
		if r.ContextChannelsTotal > 0 {
			fmt.Printf("  context_channels=%d/%d dropped=%d\n", r.ContextChannelsUsed, r.ContextChannelsTotal, r.ContextChannelsDropped)
		}
		if r.ToolCacheHits > 0 || r.ToolCacheMisses > 0 {
			fmt.Printf("  tool_cache hits=%d misses=%d\n", r.ToolCacheHits, r.ToolCacheMisses)
		}
		if r.ToolBudgetCallsLimit > 0 || r.ToolBudgetExecMSLimit > 0 {
			callLimit := "unlimited"
			if r.ToolBudgetCallsLimit > 0 {
				callLimit = fmt.Sprintf("%d", r.ToolBudgetCallsLimit)
			}
			execLimit := "unlimited"
			if r.ToolBudgetExecMSLimit > 0 {
				execLimit = fmt.Sprintf("%dms", r.ToolBudgetExecMSLimit)
			}
			fmt.Printf("  tool_budget calls=%d/%s exec_ms=%d/%s\n", r.ToolBudgetCallsUsed, callLimit, r.ToolBudgetExecMSUsed, execLimit)
		}
		if r.StageToolBudgetCallsLimit > 0 || r.StageToolBudgetExecMSLimit > 0 {
			callLimit := "unlimited"
			if r.StageToolBudgetCallsLimit > 0 {
				callLimit = fmt.Sprintf("%d", r.StageToolBudgetCallsLimit)
			}
			execLimit := "unlimited"
			if r.StageToolBudgetExecMSLimit > 0 {
				execLimit = fmt.Sprintf("%dms", r.StageToolBudgetExecMSLimit)
			}
			fmt.Printf("  stage_tool_budget calls=%d/%s exec_ms=%d/%s\n", r.StageToolBudgetCallsUsed, callLimit, r.StageToolBudgetExecMSUsed, execLimit)
		}
		if r.SentHandoffs > 0 {
			fmt.Printf("  handoffs_sent=%d\n", r.SentHandoffs)
		}
		if r.HandoffTokens > 0 || r.DroppedHandoffs > 0 {
			fmt.Printf("  handoff_publish tokens=%d dropped=%d\n", r.HandoffTokens, r.DroppedHandoffs)
		}
		if r.SkippedOutputPublish {
			fmt.Println("  handoff_publish skipped_unconsumed_output=true")
		}
		if len(r.StartupCalls) > 0 {
			for _, c := range r.StartupCalls {
				if c.Error != "" {
					fmt.Printf("  startup_call %s failed (%s): %s\n", c.Skill, c.Duration.Round(time.Millisecond), c.Error)
				} else {
					fmt.Printf("  startup_call %s ok (%s)\n", c.Skill, c.Duration.Round(time.Millisecond))
				}
			}
		}
		if len(r.ToolCalls) > 0 {
			for _, c := range r.ToolCalls {
				if c.Error != "" {
					fmt.Printf("  tool_call %s", c.Skill)
					if c.CallID != "" {
						fmt.Printf(" id=%s", c.CallID)
					}
					fmt.Printf(" failed (%s): %s\n", c.Duration.Round(time.Millisecond), c.Error)
					continue
				}
				fmt.Printf("  tool_call %s", c.Skill)
				if c.CallID != "" {
					fmt.Printf(" id=%s", c.CallID)
				}
				if len(c.Args) > 0 {
					fmt.Printf(" args=%v", c.Args)
				}
				if c.Cached {
					fmt.Printf(" cached=true")
				}
				if c.Cacheable && !c.Cached {
					fmt.Printf(" cacheable=true")
				}
				fmt.Printf(" ok (%s)\n", c.Duration.Round(time.Millisecond))
			}
		}
		if r.Error != "" {
			fmt.Printf("  error: %s\n", r.Error)
			continue
		}
		fmt.Println(r.Output)
	}
	fmt.Printf("\nFinished in %s\n", report.EndedAt.Sub(report.StartedAt).Round(time.Millisecond))
	if *showCoach {
		maybePrintCoachPostRunHint(abs, "run", &plan, report)
	}
	if *showTrace {
		fmt.Printf("Trace summary: tasks=%d stages=%d handoffs=%d parallel=%v\n", len(plan.Tasks), len(plan.Stages), len(plan.Handoffs), plan.Parallel)
	}
	return nil
}
