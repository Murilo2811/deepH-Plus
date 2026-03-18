package api

import (
	"bufio"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"runtime"
	"sync"

	"github.com/gorilla/websocket"
)

var wsUpgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

// handleTerminalWS upgrades to WebSocket and bridges a shell process.
// Each connection gets its own shell session.
func (s *Server) handleTerminalWS(w http.ResponseWriter, r *http.Request) {
	conn, err := wsUpgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[terminal] upgrade error: %v\n", err)
		return
	}
	defer conn.Close()

	// Choose shell based on OS
	var shell string
	var shellArgs []string
	if runtime.GOOS == "windows" {
		shell = "powershell.exe"
		shellArgs = []string{"-NoLogo", "-NoProfile", "-NonInteractive", "-Command", "-"}
	} else {
		shell = "/bin/bash"
		shellArgs = []string{"--norc", "--noprofile", "-i"}
	}

	cmd := exec.Command(shell, shellArgs...)
	cmd.Dir = s.workspace
	cmd.Env = append(os.Environ(), "TERM=xterm-256color")

	stdin, err := cmd.StdinPipe()
	if err != nil {
		conn.WriteMessage(websocket.TextMessage, []byte("Error: "+err.Error()+"\r\n"))
		return
	}

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		conn.WriteMessage(websocket.TextMessage, []byte("Error: "+err.Error()+"\r\n"))
		return
	}

	cmd.Stderr = cmd.Stdout // merge stderr into stdout

	if err := cmd.Start(); err != nil {
		conn.WriteMessage(websocket.TextMessage, []byte("Error starting shell: "+err.Error()+"\r\n"))
		return
	}

	var wg sync.WaitGroup

	// Goroutine: read stdout from process → send to WebSocket
	wg.Add(1)
	go func() {
		defer wg.Done()
		reader := bufio.NewReader(stdout)
		buf := make([]byte, 4096)
		for {
			n, err := reader.Read(buf)
			if n > 0 {
				if writeErr := conn.WriteMessage(websocket.TextMessage, buf[:n]); writeErr != nil {
					break
				}
			}
			if err != nil {
				if err != io.EOF {
					conn.WriteMessage(websocket.TextMessage, []byte("\r\n[process ended]\r\n"))
				}
				break
			}
		}
	}()

	// Main loop: read from WebSocket → write to process stdin
	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			break
		}
		if _, err := stdin.Write(msg); err != nil {
			break
		}
	}

	// Cleanup: close stdin and kill process
	stdin.Close()
	_ = cmd.Process.Kill()
	_ = cmd.Wait()
	wg.Wait()
}
