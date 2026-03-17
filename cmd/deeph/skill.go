package main

import (
	"errors"
	"flag"
	"fmt"
	"os"
	"path/filepath"

	"deeph/internal/catalog"
)

func cmdSkill(args []string) error {
	if len(args) == 0 {
		return errors.New("skill requires a subcommand: add")
	}
	switch args[0] {
	case "add":
		return cmdSkillAdd(args[1:])
	default:
		return fmt.Errorf("unknown skill subcommand %q", args[0])
	}
}

func cmdSkillAdd(args []string) error {
	fs := flag.NewFlagSet("skill add", flag.ContinueOnError)
	workspace := fs.String("workspace", ".", "workspace path")
	force := fs.Bool("force", false, "overwrite if file exists")
	if err := fs.Parse(args); err != nil {
		return err
	}
	rest := fs.Args()
	if len(rest) != 1 {
		return errors.New("skill add requires <name>")
	}
	tmpl, err := catalog.Get(rest[0])
	if err != nil {
		return err
	}
	abs, _ := filepath.Abs(*workspace)
	skillsDir := filepath.Join(abs, "skills")
	if err := os.MkdirAll(skillsDir, 0o755); err != nil {
		return err
	}
	outPath := filepath.Join(skillsDir, tmpl.Filename)
	if !*force {
		if _, err := os.Stat(outPath); err == nil {
			return fmt.Errorf("%s already exists (use --force to overwrite)", outPath)
		}
	}
	if err := os.WriteFile(outPath, []byte(tmpl.Content), 0o644); err != nil {
		return err
	}
	fmt.Printf("Installed skill template %q into %s\n", tmpl.Name, outPath)
	return nil
}
