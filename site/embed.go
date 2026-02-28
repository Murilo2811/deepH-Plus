package site

import (
	"embed"
	"io/fs"
	"net/http"
)

//go:embed all:out
var embedFS embed.FS

// GetFS returns the Next.js static exported files from the 'out' directory
// as an http.FileSystem. Provide all:out pattern so hidden files like _next are included
func GetFS() http.FileSystem {
	sub, err := fs.Sub(embedFS, "out")
	if err != nil {
		panic("could not acquire embedded site output folder: " + err.Error())
	}
	return http.FS(sub)
}
