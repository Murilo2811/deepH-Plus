//go:build windows

package api

import (
	"fmt"
	"sync"

	"github.com/UserExistsError/conpty"
)

type windowsPty struct {
	mu     sync.Mutex
	closed bool
	*conpty.ConPty
}

func (p *windowsPty) Read(b []byte) (int, error) {
	p.mu.Lock()
	if p.closed || p.ConPty == nil {
		p.mu.Unlock()
		return 0, fmt.Errorf("pty closed")
	}
	// ConPty.Read blocks, so we shouldn't hold the lock during Read
	// However, the lib might not be thread-safe for concurrent Close.
	// We'll trust the OS handle for now but protect the pointer.
	cpty := p.ConPty
	p.mu.Unlock()
	return cpty.Read(b)
}

func (p *windowsPty) Write(b []byte) (int, error) {
	p.mu.Lock()
	defer p.mu.Unlock()
	if p.closed || p.ConPty == nil {
		return 0, fmt.Errorf("pty closed")
	}
	return p.ConPty.Write(b)
}

func (p *windowsPty) Resize(cols, rows uint16) error {
	p.mu.Lock()
	defer p.mu.Unlock()
	if p.closed || p.ConPty == nil {
		return fmt.Errorf("pty closed")
	}
	return p.ConPty.Resize(int(cols), int(rows))
}

func (p *windowsPty) Close() error {
	p.mu.Lock()
	defer p.mu.Unlock()
	if p.closed || p.ConPty == nil {
		return nil
	}
	p.closed = true
	return p.ConPty.Close()
}

func startPTY(workspace string, cols, rows uint16) (TerminalPty, error) {
	// Options for ConPTY
	opts := []conpty.ConPtyOption{
		conpty.ConPtyWorkDir(workspace),
		conpty.ConPtyDimensions(int(cols), int(rows)),
	}

	// Start powershell
	cpty, err := conpty.Start("powershell.exe -NoLogo -NoProfile", opts...)
	if err != nil {
		return nil, err
	}

	return &windowsPty{ConPty: cpty}, nil
}
