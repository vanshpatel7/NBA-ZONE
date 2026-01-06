#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cleanup() {
  if [[ -n "${JAVA_PID:-}" ]] && kill -0 "$JAVA_PID" 2>/dev/null; then
    kill "$JAVA_PID"
  fi
  if [[ -n "${PY_PID:-}" ]] && kill -0 "$PY_PID" 2>/dev/null; then
    kill "$PY_PID"
  fi
}

trap cleanup EXIT

echo "Starting Python service..."
python3 "$ROOT_DIR/src/main/python/nba_service.py" &
PY_PID=$!

echo "Starting Spring Boot..."
(cd "$ROOT_DIR" && ./mvnw spring-boot:run) &
JAVA_PID=$!

echo "Services running. Press Ctrl+C to stop."
wait "$JAVA_PID"
