package main

import (
	"flag"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
)

func cmdShortcut(args []string) error {
	fs := flag.NewFlagSet("shortcut", flag.ContinueOnError)
	if err := fs.Parse(args); err != nil {
		return err
	}

	exePath, err := os.Executable()
	if err != nil {
		return fmt.Errorf("could not find deepH executable: %v", err)
	}

	binDir := filepath.Dir(exePath)
	launcherLabel := "deepH.lnk"
	launcherPath := filepath.Join(binDir, "deeph-launcher.exe")

	// Check if launcher actually exists
	if _, err := os.Stat(launcherPath); os.IsNotExist(err) {
		return fmt.Errorf("launcher not found at %s. Please run build script first", launcherPath)
	}

	home, err := os.UserHomeDir()
	if err != nil {
		return fmt.Errorf("could not find user home: %v", err)
	}

	desktopPath := filepath.Join(home, "Desktop", launcherLabel)

	// Create PowerShell script to generate shortcut
	psScript := fmt.Sprintf(`
$ws = New-Object -ComObject WScript.Shell
$s = $ws.CreateShortcut("%s")
$s.TargetPath = "%s"
$s.WorkingDirectory = "%s"
$s.IconLocation = "%s,0"
$s.Description = "deepH - Agentic Hub"
$s.Save()
`, desktopPath, launcherPath, binDir, launcherPath)

	cmd := exec.Command("powershell", "-NoProfile", "-NonInteractive", "-Command", psScript)
	if out, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("PowerShell failed to create shortcut: %v (output: %s)", err, string(out))
	}

	fmt.Printf("✅ Shortcut created at: %s\n", desktopPath)
	return nil
}
