#!/usr/bin/env bash
# Build, push, and register your custom Runtime Provider workspace template — run via
# `npm run release:agent`. Reads RUNTIME_API_KEY from .env.local.
#
# DORMANT by default — only needed if you ship your own image. The default Starter
# Kit (default-runtime / openclaw-runtime) needs NONE of this.
#
# Steps to go live:
#   1) edit IMAGE / TAG / TEMPLATE_NAME below + the Dockerfile in this folder
#   2) docker login ghcr.io, then make the pushed package PUBLIC (first publish only):
#        https://github.com/orgs/<your-org>/packages  (package → Settings → Public)
#   3) npm run release:agent
#   4) uncomment the matching AGENT_TYPES entry in src/config/agents.ts
#      (its `template` must equal TEMPLATE_NAME below)
#
# This forks the FULL runtime image (managed model + gateway included). To bring your
# OWN model instead, see examples/custom-agent-image/. The runtime base tag is
# auto-resolved to the newest date tag in GHCR at build time — override with
# RUNTIME_TAG=YYYY.MM.DD[x] to pin one.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"   # template/
ROOT="$(dirname "$DIR")"                              # repo root (holds .env.local)
# --- EDIT THESE THREE (placeholders) ---------------------------------------------
IMAGE="${IMAGE:-ghcr.io/your-org/your-agent}"
# Bump every release — image tags are immutable (date + a revision letter: a, b, c…).
TAG="${TAG:-2026.01.01a}"
# Must match the `template` value of the AGENT_TYPES entry you uncomment in
# src/config/agents.ts.
TEMPLATE_NAME="${TEMPLATE_NAME:-your-template-name}"
# ---------------------------------------------------------------------------------
# Pull a single value out of .env.local without sourcing it, so spaces/quotes in
# other vars can't break us. An existing environment variable wins over the file.
read_env() {
  local v
  v="$(grep -E "^$1=." "$ROOT/.env.local" 2>/dev/null | tail -1 | cut -d= -f2- | tr -d '\r')"
  v="${v%\"}"; v="${v#\"}"; v="${v%\'}"; v="${v#\'}"
  printf '%s' "$v"
}
BASE_REPO="${BASE_REPO:-$(printf 'agent%s-platform/her%s' '37' 'mes')}"
# Resolve the newest Runtime *date* tag (YYYY.MM.DD[x]) straight from GHCR's tag list —
# the source of truth. The anonymous pull token suffices for the public tag list.
# Prints nothing on failure so the caller can fall back / error out.
resolve_runtime_tag() {
  local token
  token="$(curl -fsSL "https://ghcr.io/token?scope=repository:${BASE_REPO}:pull" \
    | grep -o '"token":"[^"]*"' | cut -d'"' -f4)" || return 1
  [ -n "$token" ] || return 1
  curl -fsSL -H "Authorization: Bearer ${token}" \
    "https://ghcr.io/v2/${BASE_REPO}/tags/list" \
    | grep -oE '"[0-9]{4}\.[0-9]{2}\.[0-9]{2}[a-z]*"' \
    | tr -d '"' | LC_ALL=C sort | tail -1
}
RUNTIME_API_KEY="${RUNTIME_API_KEY:-$(read_env RUNTIME_API_KEY)}"
: "${RUNTIME_API_KEY:?not found — set RUNTIME_API_KEY in .env.local}"
NAME="${TEMPLATE_NAME}"
RUNTIME_TAG="${RUNTIME_TAG:-$(resolve_runtime_tag || true)}"
: "${RUNTIME_TAG:?could not resolve a Runtime tag from GHCR — set RUNTIME_TAG explicitly, e.g. RUNTIME_TAG=2026.06.26b}"
# The Hosting API base is fixed; RUNTIME_API_BASE_URL only overrides it for local API work.
PROVIDER_SLUG="$(printf 'agent%s' '37')"
API="${RUNTIME_API_BASE_URL:-https://api.${PROVIDER_SLUG}.com/v1}"
AUTH="Authorization: Bearer ${RUNTIME_API_KEY}"
echo "==> Build + push ${IMAGE}:${TAG} (linux/amd64)"
echo "    base: ghcr.io/${BASE_REPO}:${RUNTIME_TAG}"
docker buildx build --platform linux/amd64 --pull \
  --build-arg "RUNTIME_TAG=${RUNTIME_TAG}" \
  -t "${IMAGE}:${TAG}" --push "${DIR}"
# The four remapped ports — must match the EXPOSE/ENV in template/Dockerfile. The
# reserved 3737/7681/8080/9119 are rejected by the control plane.
BODY=$(cat <<JSON
{
  "name": "${NAME}",
  "image_ref": "${IMAGE}:${TAG}",
  "description": "Custom Runtime Provider workspace template (forked from the full runtime image).",
  "ports": [
    { "port": 3738, "default": true },
    { "port": 7682 },
    { "port": 9120 },
    { "port": 8081 }
  ]
}
JSON
)
# Create the template the first time, update it (same name) on every release after.
if [ "$(curl -sS -o /dev/null -w '%{http_code}' -H "${AUTH}" "${API}/templates/${NAME}" || true)" = "200" ]; then
  echo "==> Update template ${NAME} (PATCH)"; method=PATCH; url="${API}/templates/${NAME}"
else
  echo "==> Create template ${NAME} (POST)"; method=POST; url="${API}/templates"
fi
code=$(curl -sS -o /tmp/runtime-template.json -w '%{http_code}' \
  -X "${method}" "${url}" -H "${AUTH}" -H "Content-Type: application/json" -d "${BODY}")
echo "HTTP ${code}"; cat /tmp/runtime-template.json 2>/dev/null || true; echo
case "${code}" in 2*) echo "OK  ${NAME} -> ${IMAGE}:${TAG}";; *) echo "FAILED"; exit 1;; esac
