#!/usr/bin/env bash
# Validate _data/home.json against schemas/home.schema.json (JSON Schema draft 2020-12).
# Requires Node.js (uses npx). Run from repo root: ./scripts/validate-home-data.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
exec npx --yes ajv-cli@5 validate \
  -s schemas/home.schema.json \
  -d _data/home.json \
  --spec=draft2020
