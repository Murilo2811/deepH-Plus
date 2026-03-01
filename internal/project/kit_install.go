package project

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"deeph/internal/catalog"
)

type InstallStats struct {
	Created   int
	Updated   int
	Unchanged int
	Skipped   int
}

func (s *InstallStats) Bump(status string) {
	switch status {
	case "created":
		s.Created++
	case "updated":
		s.Updated++
	case "skipped":
		s.Skipped++
	default:
		s.Unchanged++
	}
}

type KitInstallResult struct {
	KitName         string
	SkillStats      InstallStats
	FileStats       InstallStats
	ProviderMsg     string
	ProviderChanged bool
	SuggestedCrew   string
}

func InstallKit(workspace string, kit catalog.KitTemplate, force, skipProvider, setDefaultProvider bool, providerName, model string) (*KitInstallResult, error) {
	p, err := Load(workspace)
	if err != nil {
		return nil, err
	}

	res := &KitInstallResult{
		KitName: kit.Name,
	}

	sort.Strings(kit.RequiredSkills)
	for _, skillName := range kit.RequiredSkills {
		status, err := installCatalogSkillTemplate(workspace, skillName, force)
		if err != nil {
			return nil, err
		}
		res.SkillStats.Bump(status)
	}

	for _, f := range kit.Files {
		status, err := writeKitFile(workspace, f.Path, f.Content, force)
		if err != nil {
			return nil, err
		}
		res.FileStats.Bump(status)
	}

	res.ProviderMsg = "skipped"
	if !skipProvider && strings.EqualFold(strings.TrimSpace(kit.ProviderType), "deepseek") {
		if strings.TrimSpace(providerName) == "" {
			return nil, errors.New("--provider-name cannot be empty")
		}
		msg, changed, err := ensureKitDeepseekProvider(&p.Root, strings.TrimSpace(providerName), strings.TrimSpace(model), setDefaultProvider)
		if err != nil {
			return nil, err
		}
		res.ProviderMsg = msg
		res.ProviderChanged = changed
	}
	if res.ProviderChanged {
		if err := SaveRootConfig(workspace, p.Root); err != nil {
			return nil, err
		}
	}

	res.SuggestedCrew = guessKitCrewName(kit)

	return res, nil
}

func installCatalogSkillTemplate(workspace, name string, force bool) (string, error) {
	tmpl, err := catalog.Get(name)
	if err != nil {
		return "", err
	}
	skillsDir := filepath.Join(workspace, "skills")
	if err := os.MkdirAll(skillsDir, 0o755); err != nil {
		return "", err
	}
	outPath := filepath.Join(skillsDir, tmpl.Filename)
	status, _, err := writeTextFileWithStatus(outPath, tmpl.Content, force)
	return status, err
}

func writeKitFile(workspace, relPath, content string, force bool) (string, error) {
	outPath, err := secureJoin(workspace, relPath)
	if err != nil {
		return "", err
	}
	parent := filepath.Dir(outPath)
	if err := os.MkdirAll(parent, 0o755); err != nil {
		return "", err
	}
	status, _, err := writeTextFileWithStatus(outPath, content, force)
	return status, err
}

func writeTextFileWithStatus(path, content string, force bool) (status string, outPath string, err error) {
	outPath = path
	newBytes := []byte(content)
	oldBytes, readErr := os.ReadFile(path)
	if readErr == nil {
		if string(oldBytes) == content {
			return "unchanged", outPath, nil
		}
		if !force {
			return "skipped", outPath, nil
		}
		if err := os.WriteFile(path, newBytes, 0o644); err != nil {
			return "", "", err
		}
		return "updated", outPath, nil
	}
	if !os.IsNotExist(readErr) {
		return "", "", readErr
	}
	if err := os.WriteFile(path, newBytes, 0o644); err != nil {
		return "", "", err
	}
	return "created", outPath, nil
}

func secureJoin(workspace, relPath string) (string, error) {
	clean := filepath.Clean(strings.TrimSpace(relPath))
	if clean == "." || clean == "" {
		return "", fmt.Errorf("invalid relative path %q", relPath)
	}
	if filepath.IsAbs(clean) {
		return "", fmt.Errorf("kit file path must be relative, got %q", relPath)
	}
	dst := filepath.Join(workspace, clean)
	rel, err := filepath.Rel(workspace, dst)
	if err != nil {
		return "", err
	}
	if rel == "." || strings.HasPrefix(rel, "..") {
		return "", fmt.Errorf("kit file path escapes workspace: %q", relPath)
	}
	return dst, nil
}

func ensureKitDeepseekProvider(root *RootConfig, name, model string, setDefault bool) (msg string, changed bool, err error) {
	if strings.TrimSpace(model) == "" {
		model = "deepseek-chat"
	}
	cfg := ProviderConfig{
		Name:      name,
		Type:      "deepseek",
		BaseURL:   "https://api.deepseek.com",
		APIKeyEnv: "DEEPSEEK_API_KEY",
		Model:     model,
		TimeoutMS: 30000,
	}
	idx := -1
	for i := range root.Providers {
		if root.Providers[i].Name == name {
			idx = i
			break
		}
	}
	action := "kept"
	if idx < 0 {
		root.Providers = append(root.Providers, cfg)
		idx = len(root.Providers) - 1
		action = "added"
		changed = true
	}

	existing := root.Providers[idx]
	if strings.TrimSpace(existing.Type) == "" {
		existing.Type = "deepseek"
		changed = true
	}
	if existing.Type != "deepseek" {
		return "", false, fmt.Errorf("provider %q exists with type %q (expected deepseek)", name, existing.Type)
	}
	if strings.TrimSpace(existing.BaseURL) == "" {
		existing.BaseURL = cfg.BaseURL
		changed = true
	}
	if strings.TrimSpace(existing.APIKeyEnv) == "" {
		existing.APIKeyEnv = cfg.APIKeyEnv
		changed = true
	}
	if strings.TrimSpace(existing.Model) == "" {
		existing.Model = cfg.Model
		changed = true
	}
	if existing.TimeoutMS <= 0 {
		existing.TimeoutMS = cfg.TimeoutMS
		changed = true
	}
	root.Providers[idx] = existing

	defaultInfo := ""
	if setDefault && strings.TrimSpace(root.DefaultProvider) != name {
		root.DefaultProvider = name
		changed = true
		defaultInfo = " + default_provider"
	}
	return fmt.Sprintf("%s deepseek provider %q%s", action, name, defaultInfo), changed, nil
}

func guessKitCrewName(kit catalog.KitTemplate) string {
	for _, f := range kit.Files {
		if strings.HasPrefix(f.Path, "crews/") && strings.HasSuffix(f.Path, ".yaml") {
			base := filepath.Base(f.Path)
			return strings.TrimSuffix(base, ".yaml")
		}
	}
	return "reviewpack"
}
