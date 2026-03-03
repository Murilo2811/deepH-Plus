package project

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"deeph/internal/typesys"

	"gopkg.in/yaml.v3"
)

func LoadCrewConfig(workspace, name string) (CrewConfig, string, error) {
	name = strings.TrimSpace(name)
	if name == "" {
		return CrewConfig{}, "", errors.New("crew name is empty")
	}
	if strings.ContainsAny(name, `/\`) {
		return CrewConfig{}, "", fmt.Errorf("invalid crew name %q", name)
	}
	crewDir := filepath.Join(workspace, "crews")
	candidates := []string{
		filepath.Join(crewDir, name+".yaml"),
		filepath.Join(crewDir, name+".yml"),
	}
	for _, p := range candidates {
		c, _, err := LoadCrewConfigByPath(p)
		if err == nil {
			return c, p, nil
		}
		if !os.IsNotExist(err) {
			return CrewConfig{}, "", err
		}
	}
	return CrewConfig{}, "", fmt.Errorf("unknown crew %q (tip: create %s/%s.yaml)", name, crewDir, name)
}

func LoadCrewConfigByPath(path string) (CrewConfig, string, error) {
	b, err := os.ReadFile(path)
	if err != nil {
		return CrewConfig{}, "", err
	}
	var c CrewConfig
	if err := yaml.Unmarshal(b, &c); err != nil {
		return CrewConfig{}, "", fmt.Errorf("parse %s: %w", path, err)
	}
	if strings.TrimSpace(c.Name) == "" {
		base := filepath.Base(path)
		c.Name = strings.TrimSuffix(strings.TrimSuffix(base, ".yaml"), ".yml")
	}
	if strings.TrimSpace(c.Spec) == "" && len(c.Universes) > 0 {
		c.Spec = strings.TrimSpace(c.Universes[0].Spec)
	}
	if strings.TrimSpace(c.Spec) == "" {
		return CrewConfig{}, "", fmt.Errorf("crew %q missing spec", c.Name)
	}

	if len(c.Universes) == 0 && strings.Contains(c.Spec, ">") {
		parts := strings.Split(c.Spec, ">")
		for i, part := range parts {
			cleanPart := strings.TrimSpace(part)
			if cleanPart == "" {
				continue
			}
			uc := UniverseConfig{
				Name:        cleanPart,
				Spec:        cleanPart,
				InputPort:   "context",
				OutputPort:  "result",
				OutputKind:  string(typesys.KindSummaryText),
				MergePolicy: "append",
			}
			if i > 0 {
				uc.DependsOn = []string{strings.TrimSpace(parts[i-1])}
			}
			c.Universes = append(c.Universes, uc)
		}
	}

	for i := range c.Universes {
		if strings.TrimSpace(c.Universes[i].Name) == "" {
			c.Universes[i].Name = fmt.Sprintf("u%d", i+1)
		}
		if strings.TrimSpace(c.Universes[i].Spec) == "" {
			c.Universes[i].Spec = c.Spec
		}
		if strings.TrimSpace(c.Universes[i].InputPort) == "" {
			c.Universes[i].InputPort = "context"
		}
		if strings.TrimSpace(c.Universes[i].OutputPort) == "" {
			c.Universes[i].OutputPort = "result"
		}
		if strings.TrimSpace(c.Universes[i].OutputKind) == "" {
			c.Universes[i].OutputKind = string(typesys.KindSummaryText)
		} else if k, ok := typesys.NormalizeKind(c.Universes[i].OutputKind); ok {
			c.Universes[i].OutputKind = k.String()
		} else {
			return CrewConfig{}, "", fmt.Errorf("crew %q universe %q has unknown output_kind %q", c.Name, c.Universes[i].Name, c.Universes[i].OutputKind)
		}
		if strings.TrimSpace(c.Universes[i].MergePolicy) == "" {
			c.Universes[i].MergePolicy = "append"
		}
	}
	return c, path, nil
}
