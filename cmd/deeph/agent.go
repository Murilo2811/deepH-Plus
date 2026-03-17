package main

import (
	"errors"
	"flag"
	"fmt"
	"path/filepath"
	"strings"

	"deeph/internal/project"
	"deeph/internal/scaffold"
)

func cmdAgent(args []string) error {
	if len(args) == 0 {
		return errors.New("agent requires a subcommand: create")
	}
	switch args[0] {
	case "create":
		return cmdAgentCreate(args[1:])
	default:
		return fmt.Errorf("unknown agent subcommand %q", args[0])
	}
}

func cmdAgentCreate(args []string) error {
	fs := flag.NewFlagSet("agent create", flag.ContinueOnError)
	workspace := fs.String("workspace", ".", "workspace path")
	force := fs.Bool("force", false, "overwrite if file exists")
	provider := fs.String("provider", "", "provider name (defaults to deeph.yaml default_provider when available)")
	model := fs.String("model", "mock-small", "model name")
	rest, err := parseFlagsLoose(fs, args)
	if err != nil {
		return err
	}
	if len(rest) != 1 {
		return errors.New("agent create requires <name>")
	}

	abs, err := filepath.Abs(*workspace)
	if err != nil {
		return err
	}

	selectedProvider := strings.TrimSpace(*provider)
	if selectedProvider == "" {
		if p, err := project.Load(abs); err == nil {
			selectedProvider = strings.TrimSpace(p.Root.DefaultProvider)
		}
	}

	outPath, err := scaffold.CreateAgentFile(abs, scaffold.AgentTemplateOptions{
		Name:        rest[0],
		Provider:    selectedProvider,
		Model:       strings.TrimSpace(*model),
		Description: "User-defined agent",
		Force:       *force,
	})
	if err != nil {
		return err
	}

	fmt.Printf("Created agent template at %s\n", outPath)
	if selectedProvider == "" {
		fmt.Println("Tip: set `provider:` in the agent YAML or configure `default_provider` in deeph.yaml.")
	}
	fmt.Println("Next steps:")
	fmt.Println("  1. Edit the system_prompt in the new agent file")
	fmt.Println("  2. Optionally install skills: deeph skill list && deeph skill add echo")
	fmt.Println("  3. deeph validate")
	fmt.Println("  4. deeph run " + rest[0] + " \"teste\"")
	return nil
}
