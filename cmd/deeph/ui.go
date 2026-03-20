package main

import (
	"flag"
	"fmt"
	"os/exec"
	"path/filepath"
	"time"

	"deeph/internal/api"
)

func cmdUi(args []string) error {
	fs := flag.NewFlagSet("ui", flag.ContinueOnError)
	workspace := fs.String("workspace", ".", "workspace path")
	port := fs.Int("port", 7730, "port to run UI server on")
	noBrowser := fs.Bool("no-browser", false, "do not open browser automatically")
	if err := fs.Parse(args); err != nil {
		return err
	}

	abs, err := filepath.Abs(*workspace)
	if err != nil {
		return fmt.Errorf("abs: %w", err)
	}

	addr := fmt.Sprintf("localhost:%d", *port)
	srv := api.NewServer(abs, addr)

	if !*noBrowser {
		go func() {
			if err := api.WaitForReady(addr, 10*time.Second); err != nil {
				fmt.Printf("Warning: could not verify server is ready: %v\n", err)
			}
			// fallback simples para dev Windows (no futuro pode ter cross-platform)
			exec.Command("rundll32", "url.dll,FileProtocolHandler", "http://"+addr).Start()
		}()
	}

	return srv.Start()
}
