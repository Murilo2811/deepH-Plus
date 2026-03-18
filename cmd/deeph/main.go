package main

import (
	"flag"
	"fmt"
	"os"
	"path/filepath"

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
