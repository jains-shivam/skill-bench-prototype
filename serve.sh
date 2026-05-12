#!/usr/bin/env bash
# One-line local server for the Skill Bench prototype.
# Usage: ./serve.sh [port]  (default port 8000)
set -euo pipefail
PORT="${1:-8000}"
cd "$(dirname "$0")"
echo "Serving Skill Bench prototype on http://127.0.0.1:${PORT}"
echo "Open http://127.0.0.1:${PORT}/index.html"
echo "Ctrl+C to stop."
exec python3 -m http.server "${PORT}"
