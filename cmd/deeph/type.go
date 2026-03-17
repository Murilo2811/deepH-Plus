package main

import (
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"os"
	"strings"

	"deeph/internal/typesys"
)

func cmdType(args []string) error {
	if len(args) == 0 {
		return errors.New("type requires a subcommand: list or explain")
	}
	switch args[0] {
	case "list":
		return cmdTypeList(args[1:])
	case "explain":
		return cmdTypeExplain(args[1:])
	default:
		return fmt.Errorf("unknown type subcommand %q", args[0])
	}
}

func cmdTypeList(args []string) error {
	fs := flag.NewFlagSet("type list", flag.ContinueOnError)
	category := fs.String("category", "", "filter by category (code, text, json, ...)")
	jsonOut := fs.Bool("json", false, "print types as JSON")
	if err := fs.Parse(args); err != nil {
		return err
	}
	catFilter := strings.TrimSpace(strings.ToLower(*category))

	defs := typesys.List()
	if *jsonOut {
		filtered := make([]typesys.TypeDef, 0, len(defs))
		for _, d := range defs {
			if catFilter != "" && d.Category != catFilter {
				continue
			}
			filtered = append(filtered, d)
		}
		if len(filtered) == 0 && catFilter != "" {
			return fmt.Errorf("no types found for category %q", catFilter)
		}
		payload := struct {
			Category string            `json:"category,omitempty"`
			Types    []typesys.TypeDef `json:"types"`
		}{
			Category: catFilter,
			Types:    filtered,
		}
		enc := json.NewEncoder(os.Stdout)
		enc.SetIndent("", "  ")
		return enc.Encode(payload)
	}
	lastCategory := ""
	for _, d := range defs {
		if catFilter != "" && d.Category != catFilter {
			continue
		}
		if d.Category != lastCategory {
			if lastCategory != "" {
				fmt.Println("")
			}
			fmt.Printf("[%s]\n", d.Category)
			lastCategory = d.Category
		}
		fmt.Printf("- %s", d.Kind)
		if len(d.Aliases) > 0 {
			fmt.Printf(" (aliases: %s)", strings.Join(d.Aliases, ", "))
		}
		fmt.Printf(": %s\n", d.Description)
	}
	if lastCategory == "" {
		if catFilter == "" {
			fmt.Println("No types registered.")
		} else {
			return fmt.Errorf("no types found for category %q", catFilter)
		}
	}
	return nil
}

func cmdTypeExplain(args []string) error {
	fs := flag.NewFlagSet("type explain", flag.ContinueOnError)
	jsonOut := fs.Bool("json", false, "print type entry as JSON")
	if err := fs.Parse(args); err != nil {
		return err
	}
	rest := fs.Args()
	if len(rest) != 1 {
		return errors.New("type explain requires <kind|alias>")
	}
	def, ok := typesys.Lookup(rest[0])
	if !ok {
		return fmt.Errorf("unknown type %q", rest[0])
	}
	if *jsonOut {
		enc := json.NewEncoder(os.Stdout)
		enc.SetIndent("", "  ")
		return enc.Encode(def)
	}
	fmt.Printf("kind: %s\n", def.Kind)
	fmt.Printf("category: %s\n", def.Category)
	fmt.Printf("description: %s\n", def.Description)
	if len(def.Aliases) > 0 {
		fmt.Printf("aliases: %s\n", strings.Join(def.Aliases, ", "))
	}
	return nil
}
