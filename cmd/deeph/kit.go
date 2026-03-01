package main

import (
	"errors"
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"deeph/internal/catalog"
	"deeph/internal/project"
)

func cmdKit(args []string) error {
	if len(args) == 0 {
		return errors.New("kit requires a subcommand: list or add")
	}
	switch args[0] {
	case "list":
		return cmdKitList(args[1:])
	case "add":
		return cmdKitAdd(args[1:])
	default:
		return fmt.Errorf("unknown kit subcommand %q", args[0])
	}
}

func cmdKitList(args []string) error {
	fs := flag.NewFlagSet("kit list", flag.ContinueOnError)
	workspace := fs.String("workspace", ".", "workspace path")
	if err := fs.Parse(args); err != nil {
		return err
	}
	if len(fs.Args()) != 0 {
		return errors.New("kit list does not accept positional arguments")
	}
	abs, err := filepath.Abs(*workspace)
	if err != nil {
		return err
	}
	recordCoachCommandTransition(abs, "kit list")
	kits := catalog.ListKits()
	if len(kits) == 0 {
		fmt.Println("No kits registered.")
		return nil
	}
	for _, k := range kits {
		fmt.Printf("- %s: %s (skills=%d files=%d", k.Name, k.Description, len(k.RequiredSkills), len(k.Files))
		if strings.TrimSpace(k.ProviderType) != "" {
			fmt.Printf(" provider=%s", k.ProviderType)
		}
		fmt.Printf(")\n")
	}
	return nil
}

func cmdKitAdd(args []string) error {
	fs := flag.NewFlagSet("kit add", flag.ContinueOnError)
	workspace := fs.String("workspace", ".", "workspace path")
	force := fs.Bool("force", false, "overwrite existing files/skills when content differs")
	providerName := fs.String("provider-name", "deepseek", "provider name to scaffold when kit requires deepseek")
	model := fs.String("model", "deepseek-chat", "provider model used when scaffolding deepseek")
	setDefaultProvider := fs.Bool("set-default-provider", true, "set scaffoled provider as default_provider")
	skipProvider := fs.Bool("skip-provider", false, "do not scaffold provider configuration")
	if err := fs.Parse(args); err != nil {
		return err
	}
	rest := fs.Args()
	if len(rest) != 1 {
		return errors.New("kit add requires <name|git-url[#manifest.yaml]>")
	}

	abs, err := filepath.Abs(*workspace)
	if err != nil {
		return err
	}
	rootPath := filepath.Join(abs, project.RootConfigFile)
	if _, err := os.Stat(rootPath); err != nil {
		if os.IsNotExist(err) {
			return fmt.Errorf("workspace not initialized: %s not found (run `deeph init` first)", rootPath)
		}
		return err
	}

	kit, sourceLabel, err := resolveKitTemplate(strings.TrimSpace(rest[0]))
	if err != nil {
		return err
	}
	recordCoachCommandTransition(abs, "kit add", kit.Name)

	res, err := project.InstallKit(abs, kit, *force, *skipProvider, *setDefaultProvider, *providerName, *model)
	if err != nil {
		return err
	}

	reloaded, err := project.Load(abs)
	if err != nil {
		return err
	}
	verr := project.Validate(reloaded)
	printValidation(verr)
	if verr != nil && verr.HasErrors() {
		return verr
	}

	fmt.Printf("Installed kit %q in %s\n", res.KitName, abs)
	fmt.Printf("  source: %s\n", sourceLabel)
	fmt.Printf("  skills: created=%d updated=%d unchanged=%d skipped=%d\n", res.SkillStats.Created, res.SkillStats.Updated, res.SkillStats.Unchanged, res.SkillStats.Skipped)
	fmt.Printf("  files:  created=%d updated=%d unchanged=%d skipped=%d\n", res.FileStats.Created, res.FileStats.Updated, res.FileStats.Unchanged, res.FileStats.Skipped)
	fmt.Printf("  provider: %s\n", res.ProviderMsg)
	fmt.Println("Next steps:")
	fmt.Println("  1. deeph validate")
	fmt.Printf("  2. deeph crew list\n")
	fmt.Printf("  3. deeph run --multiverse 0 @%s \"sua tarefa\"\n", res.SuggestedCrew)
	return nil
}
