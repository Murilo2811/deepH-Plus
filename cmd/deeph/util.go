package main

import (
	"fmt"
	"path/filepath"

	"deeph/internal/project"
)

func loadAndValidate(workspace string) (*project.Project, string, *project.ValidationError, error) {
	abs, err := filepath.Abs(workspace)
	if err != nil {
		return nil, "", nil, err
	}
	p, err := project.Load(abs)
	if err != nil {
		return nil, abs, nil, err
	}
	verr := project.Validate(p)
	return p, abs, verr, nil
}

func printValidation(verr *project.ValidationError) {
	if verr == nil || len(verr.Issues) == 0 {
		return
	}
	for _, issue := range verr.Issues {
		fmt.Println(issue.String())
	}
}
