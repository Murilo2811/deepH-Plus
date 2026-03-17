package main

import (
	"errors"
	"flag"
	"fmt"
	"path/filepath"
	"strings"

	"deeph/internal/project"
)

func cmdProvider(args []string) error {
	if len(args) == 0 {
		return errors.New("provider requires a subcommand: list or add")
	}
	switch args[0] {
	case "list":
		return cmdProviderList(args[1:])
	case "add":
		return cmdProviderAdd(args[1:])
	default:
		return fmt.Errorf("unknown provider subcommand %q", args[0])
	}
}

func cmdProviderList(args []string) error {
	fs := flag.NewFlagSet("provider list", flag.ContinueOnError)
	workspace := fs.String("workspace", ".", "workspace path")
	if err := fs.Parse(args); err != nil {
		return err
	}
	abs, err := filepath.Abs(*workspace)
	if err != nil {
		return err
	}
	p, err := project.Load(abs)
	if err != nil {
		return err
	}
	if len(p.Root.Providers) == 0 {
		fmt.Println("No providers configured in " + project.RootConfigFile)
		return nil
	}
	for _, pr := range p.Root.Providers {
		fmt.Printf("- %s (type=%s model=%s baseURL=%s env=%s)\n", pr.Name, pr.Type, pr.Model, pr.BaseURL, pr.APIKeyEnv)
	}
	if p.Root.DefaultProvider != "" {
		fmt.Printf("\nDefault provider: %s\n", p.Root.DefaultProvider)
	}
	return nil
}

func cmdProviderAdd(args []string) error {
	fs := flag.NewFlagSet("provider add", flag.ContinueOnError)
	workspace := fs.String("workspace", ".", "workspace path")
	force := fs.Bool("force", false, "overwrite existing provider with same name")
	setDefault := fs.Bool("set-default", false, "set this provider as the default")

	name := fs.String("name", "deepseek", "provider name alias (e.g. together, local, main)")
	providerType := fs.String("type", "deepseek", "provider API type pattern (currently only 'deepseek' is supported)")
	baseURL := fs.String("base-url", "https://api.deepseek.com", "base URL for the API")
	apiKeyEnv := fs.String("api-key-env", "DEEPSEEK_API_KEY", "environment variable to read the API key from")
	model := fs.String("model", "deepseek-chat", "default model name for this provider")
	timeoutMS := fs.Int("timeout-ms", 30000, "default timeout in milliseconds")

	if err := fs.Parse(args); err != nil {
		return err
	}

	if *providerType != "deepseek" {
		return fmt.Errorf("unsupported provider type %q (currently only deepseek is scaffolded)", *providerType)
	}
	if strings.TrimSpace(*name) == "" {
		return errors.New("--name cannot be empty")
	}
	if *timeoutMS < 0 {
		return errors.New("--timeout-ms must be >= 0")
	}

	abs, err := filepath.Abs(*workspace)
	if err != nil {
		return err
	}
	p, err := project.Load(abs)
	if err != nil {
		return err
	}

	cfg := project.ProviderConfig{
		Name:      strings.TrimSpace(*name),
		Type:      "deepseek",
		BaseURL:   strings.TrimSpace(*baseURL),
		APIKeyEnv: strings.TrimSpace(*apiKeyEnv),
		Model:     strings.TrimSpace(*model),
		TimeoutMS: *timeoutMS,
	}
	if cfg.TimeoutMS == 0 {
		cfg.TimeoutMS = 30000
	}
	if cfg.Model == "" {
		cfg.Model = "deepseek-chat"
	}
	if cfg.BaseURL == "" {
		cfg.BaseURL = "https://api.deepseek.com"
	}
	if cfg.APIKeyEnv == "" {
		cfg.APIKeyEnv = "DEEPSEEK_API_KEY"
	}

	replaced := false
	for i := range p.Root.Providers {
		if p.Root.Providers[i].Name != cfg.Name {
			continue
		}
		if !*force {
			return fmt.Errorf("provider %q already exists (use --force to replace)", cfg.Name)
		}
		p.Root.Providers[i] = cfg
		replaced = true
		break
	}
	if !replaced {
		p.Root.Providers = append(p.Root.Providers, cfg)
	}
	if *setDefault || strings.TrimSpace(p.Root.DefaultProvider) == "" {
		p.Root.DefaultProvider = cfg.Name
	}

	if verr := project.Validate(&project.Project{Root: p.Root}); verr != nil && verr.HasErrors() {
		return verr
	}
	if err := project.SaveRootConfig(abs, p.Root); err != nil {
		return err
	}

	action := "Added"
	if replaced {
		action = "Updated"
	}
	fmt.Printf("%s provider %q (type=deepseek) in %s\n", action, cfg.Name, filepath.Join(abs, project.RootConfigFile))
	if *setDefault || strings.TrimSpace(p.Root.DefaultProvider) == cfg.Name {
		fmt.Printf("default_provider=%s\n", p.Root.DefaultProvider)
	}
	fmt.Printf("Next steps:\n")
	fmt.Printf("  1. export %s=\"<your_key>\"\n", cfg.APIKeyEnv)
	fmt.Printf("  2. deeph provider list\n")
	fmt.Printf("  3. deeph agent create --provider %s --model %s analyst\n", cfg.Name, cfg.Model)
	return nil
}
