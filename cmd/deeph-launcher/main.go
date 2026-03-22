package main

import (
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	"deeph/internal/api"
)

func main() {
	// 1. Resolve workspace as the dir of the .exe
	exePath, err := os.Executable()
	if err != nil {
		fmt.Printf("Fatal: os.Executable failed: %v\n", err)
		os.Exit(1)
	}
	workspace := filepath.Dir(exePath)

	// In production we usually look for 'site' folder relative to exe
	// But since it's embedded, we just pass the workspace path for config loading
	addr := "localhost:7730"

	// 2. Check if server is already running
	if resp, err := http.Get("http://" + addr + "/api/config"); err == nil && resp.StatusCode == 200 {
		resp.Body.Close()
		fmt.Println("Server already running, opening browser...")
		exec.Command("cmd", "/c", "start", "http://"+addr).Start()
		return
	}

	srv := api.NewServer(workspace, addr)

	// 2. Start server in background
	go func() {
		if err := srv.Start(); err != nil {
			fmt.Printf("Server crash: %v\n", err)
			os.Exit(1)
		}
	}()

	// 3. Wait for it to be alive
	if err := api.WaitForReady(addr, 15*time.Second); err != nil {
		// Log error somewhere or show a message box if needed
		os.Exit(1)
	}

	// 4. Open browser
	exec.Command("cmd", "/c", "start", "http://"+addr).Start()

	// 5. Block forever (no terminal window visible)
	select {}
}
