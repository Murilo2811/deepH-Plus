package project

import (
	"fmt"
)

type RootConfig struct {
	Version         int              `yaml:"version" json:"version"`
	DefaultProvider string           `yaml:"default_provider" json:"default_provider"`
	Providers       []ProviderConfig `yaml:"providers" json:"providers"`
}

type ProviderConfig struct {
	Name      string            `yaml:"name" json:"name"`
	Type      string            `yaml:"type" json:"type"`
	BaseURL   string            `yaml:"base_url" json:"base_url,omitempty"`
	APIKeyEnv string            `yaml:"api_key_env" json:"api_key_env,omitempty"`
	Model     string            `yaml:"model" json:"model,omitempty"`
	Headers   map[string]string `yaml:"headers" json:"headers,omitempty"`
	TimeoutMS int               `yaml:"timeout_ms" json:"timeout_ms,omitempty"`
}

type AgentConfig struct {
	Name           string              `yaml:"name" json:"name"`
	Description    string              `yaml:"description" json:"description,omitempty"`
	Provider       string              `yaml:"provider" json:"provider,omitempty"`
	Model          string              `yaml:"model" json:"model,omitempty"`
	SystemPrompt   string              `yaml:"system_prompt" json:"system_prompt,omitempty"`
	Skills         []string            `yaml:"skills" json:"skills,omitempty"`
	DependsOn      []string            `yaml:"depends_on" json:"depends_on,omitempty"`
	DependsOnPorts map[string][]string `yaml:"depends_on_ports" json:"depends_on_ports,omitempty"`
	IO             AgentIOConfig       `yaml:"io" json:"io,omitempty"`
	StartupCalls   []SkillCall         `yaml:"startup_calls" json:"startup_calls,omitempty"`
	TimeoutMS      int                 `yaml:"timeout_ms" json:"timeout_ms,omitempty"`
	Metadata       map[string]string   `yaml:"metadata" json:"metadata,omitempty"`
}

type AgentIOConfig struct {
	Inputs  []IOPortConfig `yaml:"inputs" json:"inputs,omitempty"`
	Outputs []IOPortConfig `yaml:"outputs" json:"outputs,omitempty"`
}

type IOPortConfig struct {
	Name        string   `yaml:"name" json:"name"`
	Accepts     []string `yaml:"accepts" json:"accepts,omitempty"`
	Produces    []string `yaml:"produces" json:"produces,omitempty"`
	MergePolicy string   `yaml:"merge_policy" json:"merge_policy,omitempty"`
	// ChannelPriority biases publish selection for handoffs targeting this input port.
	// Higher values win earlier under publish budget pressure.
	ChannelPriority float64 `yaml:"channel_priority" json:"channel_priority,omitempty"`
	Required        bool    `yaml:"required" json:"required,omitempty"`
	MaxTokens       int     `yaml:"max_tokens" json:"max_tokens,omitempty"`
	Description     string  `yaml:"description" json:"description,omitempty"`
}

type SkillCall struct {
	Skill string         `yaml:"skill" json:"skill"`
	Args  map[string]any `yaml:"args" json:"args,omitempty"`
}

type SkillConfig struct {
	Name        string            `yaml:"name" json:"name"`
	Type        string            `yaml:"type" json:"type"`
	Description string            `yaml:"description" json:"description,omitempty"`
	Method      string            `yaml:"method" json:"method,omitempty"`
	URL         string            `yaml:"url" json:"url,omitempty"`
	Headers     map[string]string `yaml:"headers" json:"headers,omitempty"`
	TimeoutMS   int               `yaml:"timeout_ms" json:"timeout_ms,omitempty"`
	Params      map[string]any    `yaml:"params" json:"params,omitempty"`
}

type Project struct {
	Root       RootConfig
	Agents     []AgentConfig
	Skills     []SkillConfig
	AgentFiles map[string]string
	SkillFiles map[string]string
}

type IssueLevel string

const (
	IssueError   IssueLevel = "error"
	IssueWarning IssueLevel = "warning"
)

type Issue struct {
	Level   IssueLevel
	Path    string
	Field   string
	Message string
}

func (i Issue) String() string {
	if i.Field == "" {
		return fmt.Sprintf("[%s] %s: %s", i.Level, i.Path, i.Message)
	}
	return fmt.Sprintf("[%s] %s (%s): %s", i.Level, i.Path, i.Field, i.Message)
}

type ValidationError struct {
	Issues []Issue
}

func (e *ValidationError) Error() string {
	if e == nil || len(e.Issues) == 0 {
		return "validation failed"
	}
	return fmt.Sprintf("validation failed with %d issue(s)", len(e.Issues))
}

func (e *ValidationError) HasErrors() bool {
	if e == nil {
		return false
	}
	for _, it := range e.Issues {
		if it.Level == IssueError {
			return true
		}
	}
	return false
}
