package api

import (
	"crypto/rand"
	"encoding/hex"
	"sync"
	"time"
)

func generateTerminalID() string {
	b := make([]byte, 4)
	rand.Read(b)
	return hex.EncodeToString(b)
}

type TerminalSession struct {
	ID        string      `json:"id"`
	Title     string      `json:"title"`
	CreatedAt time.Time   `json:"createdAt"`
	Pty       TerminalPty `json:"-"`

	mu        sync.Mutex
	listeners []chan []byte
}

func (s *TerminalSession) AddListener(c chan []byte) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.listeners = append(s.listeners, c)
}

func (s *TerminalSession) RemoveListener(c chan []byte) {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i, l := range s.listeners {
		if l == c {
			s.listeners = append(s.listeners[:i], s.listeners[i+1:]...)
			break
		}
	}
}

func (s *TerminalSession) Broadcast(data []byte) {
	s.mu.Lock()
	defer s.mu.Unlock()
	for _, l := range s.listeners {
		select {
		case l <- data:
		default:
			// Client channel full, skip to avoid blocking the PTY reader
		}
	}
}

type TerminalPool struct {
	mu       sync.RWMutex
	sessions map[string]*TerminalSession
}

func NewTerminalPool() *TerminalPool {
	return &TerminalPool{
		sessions: make(map[string]*TerminalSession),
	}
}

func (p *TerminalPool) Create(workspace string) (*TerminalSession, error) {
	// Start with default size
	ptmx, err := startPTY(workspace, 120, 30)
	if err != nil {
		return nil, err
	}

	session := &TerminalSession{
		ID:        generateTerminalID(),
		Title:     "New Terminal",
		CreatedAt: time.Now(),
		Pty:       ptmx,
	}

	// Read loop continuously from PTY to all listeners
	go func() {
		buf := make([]byte, 8192)
		for {
			n, err := ptmx.Read(buf)
			if n > 0 {
				cpy := make([]byte, n)
				copy(cpy, buf[:n])
				session.Broadcast(cpy)
			}
			if err != nil {
				// PTY closed or process died.
				break
			}
		}
	}()

	p.mu.Lock()
	defer p.mu.Unlock()
	p.sessions[session.ID] = session

	return session, nil
}

func (p *TerminalPool) Get(id string) (*TerminalSession, bool) {
	p.mu.RLock()
	defer p.mu.RUnlock()
	s, ok := p.sessions[id]
	return s, ok
}

func (p *TerminalPool) Remove(id string) {
	p.mu.Lock()
	var s *TerminalSession
	var ok bool
	if s, ok = p.sessions[id]; ok {
		delete(p.sessions, id)
	}
	p.mu.Unlock()

	// Close outside of lock
	if ok && s != nil && s.Pty != nil {
		s.Pty.Close()
	}
}

func (p *TerminalPool) List() []*TerminalSession {
	p.mu.RLock()
	defer p.mu.RUnlock()
	var list []*TerminalSession
	for _, s := range p.sessions {
		list = append(list, s)
	}
	return list
}
