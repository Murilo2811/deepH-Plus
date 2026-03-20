//go:build !windows

package api

import (
	"os"
	"os/exec"

	"github.com/creack/pty"
)

type unixPty struct {
	*os.File
	cmd *exec.Cmd
}

func (p *unixPty) Resize(cols, rows uint16) error {
	return pty.Setsize(p.File, &pty.Winsize{Cols: cols, Rows: rows})
}

func (p *unixPty) Close() error {
	_ = p.File.Close()
	if p.cmd.Process != nil {
		_ = p.cmd.Process.Kill()
	}
	_ = p.cmd.Wait()
	return nil
}

func startPTY(workspace string, cols, rows uint16) (TerminalPty, error) {
	shell := "/bin/bash"
	if _, err := os.Stat(shell); err != nil {
		shell = "/bin/sh"
	}
	cmd := exec.Command(shell, "--norc", "--noprofile", "-i")
	cmd.Dir = workspace
	cmd.Env = append(os.Environ(), "TERM=xterm-256color")

	ptmx, err := pty.StartWithSize(cmd, &pty.Winsize{Cols: cols, Rows: rows})
	if err != nil {
		return nil, err
	}

	return &unixPty{File: ptmx, cmd: cmd}, nil
}
