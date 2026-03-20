package api

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"sync"

	"github.com/gorilla/websocket"
)

// resizeMsg is sent by the frontend when the terminal dimensions change.
type resizeMsg struct {
	Type string `json:"type"`
	Cols uint16 `json:"cols"`
	Rows uint16 `json:"rows"`
}

// TerminalPty defines the interface for a pseudo-terminal.
type TerminalPty interface {
	io.ReadWriteCloser
	Resize(cols, rows uint16) error
}

var wsUpgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func (s *Server) handleTerminalWS(w http.ResponseWriter, r *http.Request) {
	conn, err := wsUpgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[terminal] upgrade error: %v\n", err)
		return
	}

	id := r.URL.Query().Get("id")
	var session *TerminalSession
	if id != "" {
		var ok bool
		session, ok = s.termPool.Get(id)
		if !ok {
			fmt.Fprintf(os.Stderr, "[terminal] session not found for id: %s\n", id)
			_ = conn.WriteMessage(websocket.TextMessage, []byte("Error: Terminal session not found\r\n"))
			conn.Close()
			return
		}
	} else {
		// Compat auto-create
		session, err = s.termPool.Create(s.workspace)
		if err != nil {
			fmt.Fprintf(os.Stderr, "[terminal] PTY start error: %v\n", err)
			_ = conn.WriteMessage(websocket.TextMessage, []byte("Error creating terminal: "+err.Error()+"\r\n"))
			conn.Close()
			return
		}
	}

	var wsMu sync.Mutex
	writeWS := func(messageType int, data []byte) error {
		wsMu.Lock()
		defer wsMu.Unlock()
		return conn.WriteMessage(messageType, data)
	}

	msgChan := make(chan []byte, 100)
	session.AddListener(msgChan)

	var closeOnce sync.Once
	safeClose := func() {
		closeOnce.Do(func() {
			session.RemoveListener(msgChan)
			_ = conn.Close()
		})
	}
	defer safeClose()

	var wg sync.WaitGroup

	// Writer to WS
	wg.Add(1)
	go func() {
		defer wg.Done()
		defer safeClose()
		for msg := range msgChan {
			if err := writeWS(websocket.BinaryMessage, msg); err != nil {
				break
			}
		}
	}()

	// Reader from WS
	for {
		msgType, msg, err := conn.ReadMessage()
		if err != nil {
			break
		}

		if msgType == websocket.TextMessage {
			var rm resizeMsg
			if json.Unmarshal(msg, &rm) == nil && rm.Type == "resize" && rm.Cols > 0 && rm.Rows > 0 {
				_ = session.Pty.Resize(rm.Cols, rm.Rows)
				continue
			}
		}

		if len(msg) > 0 {
			if _, err := session.Pty.Write(msg); err != nil {
				fmt.Fprintf(os.Stderr, "[terminal] pty write error: %v\n", err)
				break
			}
		}
	}

	safeClose()
	wg.Wait()
}
