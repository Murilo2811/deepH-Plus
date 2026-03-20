package api

import (
	"fmt"
	"net/http"
	"time"
)

// WaitForReady polls the server until it responds HTTP 200 or timeout.
func WaitForReady(addr string, timeout time.Duration) error {
	deadline := time.Now().Add(timeout)
	url := fmt.Sprintf("http://%s/api/config", addr)

	for time.Now().Before(deadline) {
		// Use a short timeout for the check itself
		client := http.Client{
			Timeout: 1 * time.Second,
		}
		resp, err := client.Get(url)
		if err == nil {
			if resp.StatusCode == http.StatusOK {
				resp.Body.Close()
				return nil
			}
			resp.Body.Close()
		}
		time.Sleep(250 * time.Millisecond)
	}

	return fmt.Errorf("server at %s did not become ready within %v", addr, timeout)
}
