#!/usr/bin/env bash
set -euo pipefail

FLOW_NAME="${1:?Pass a flow name, e.g. home-intro}"
URL="${2:-${MIGRATED_URL:-http://localhost:3000}}"
SESSION="animation-migrated"
ROOT=".cursor/artifacts/animations/$FLOW_NAME/migrated"
FLOW_SCRIPT=".cursor/skills/animation-parity/scripts/animation/flows/$FLOW_NAME.sh"

mkdir -p "$ROOT"
cat > "$ROOT/capture-metadata.txt" <<EOF
implementation=migrated
flow=$FLOW_NAME
url=$URL
viewport=${ANIMATION_VIEWPORT_WIDTH:-1440}x${ANIMATION_VIEWPORT_HEIGHT:-900}
dpr=${ANIMATION_DPR:-2}
ready_wait_ms=${ANIMATION_READY_WAIT_MS:-500}
clarity_wait_ms=${ANIMATION_CLARITY_WAIT_MS:-1500}
flow_script=$FLOW_SCRIPT
captured_at=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
EOF

agent-browser --session "$SESSION" set viewport \
  "${ANIMATION_VIEWPORT_WIDTH:-1440}" \
  "${ANIMATION_VIEWPORT_HEIGHT:-900}" \
  "${ANIMATION_DPR:-2}"
agent-browser --session "$SESSION" open "$URL"
agent-browser --session "$SESSION" wait --load networkidle
agent-browser --session "$SESSION" wait --fn \
  "document.fonts && document.fonts.status === 'loaded'"
agent-browser --session "$SESSION" wait "${ANIMATION_READY_WAIT_MS:-500}"
agent-browser --session "$SESSION" snapshot -i > "$ROOT/before.snapshot.txt"
agent-browser --session "$SESSION" screenshot --annotate "$ROOT/before.annotated.png"
agent-browser --session "$SESSION" record start "$ROOT/run.webm"

if [[ -x "$FLOW_SCRIPT" ]]; then
  bash "$FLOW_SCRIPT" "$SESSION"
else
  agent-browser --session "$SESSION" wait "${ANIMATION_CLARITY_WAIT_MS:-1500}"
fi

agent-browser --session "$SESSION" record stop
agent-browser --session "$SESSION" screenshot "$ROOT/after.png"
agent-browser --session "$SESSION" snapshot -i > "$ROOT/after.snapshot.txt"
