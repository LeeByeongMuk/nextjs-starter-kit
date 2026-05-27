#!/usr/bin/env bash
# PostToolUse(Edit|Write) 비차단 경고 — 소스 파일에 console.log / debugger 잔존 시 알림.
# 편집은 이미 적용된 상태(Post). exit 2 로 stderr 메시지를 Claude 에게 피드백한다(되돌리지 않음).
set -euo pipefail

input=$(cat)
fp=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')

case "$fp" in
  *.ts|*.tsx|*.js|*.jsx) ;;
  *) exit 0 ;;
esac

body=$(printf '%s' "$input" | jq -r '.tool_input.content // .tool_input.new_string // empty')

if printf '%s' "$body" | grep -nE 'console\.log\(|debugger;' >/dev/null 2>&1; then
  echo "WARN: ${fp} 에 console.log/debugger 감지 — 커밋 전 확인 (의도된 코드면 무시)" >&2
  exit 2
fi

exit 0
