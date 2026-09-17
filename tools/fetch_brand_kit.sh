#!/usr/bin/env bash
# Recursively download selected parts of the brand kit Drive folder into brand_kit/
set -euo pipefail
GD=/google/bin/releases/gemini-agents-gdrive/gdrive
DEST="$1"; shift
mkdir -p "$DEST"

download_folder() {
  local fid="$1" out="$2"
  mkdir -p "$out"
  $GD --json readonly ls "$fid" --max 200 | python3 -c '
import sys,json
for f in json.load(sys.stdin):
    print(f["id"] + "\t" + f["name"] + "\t" + f.get("mimeType",""))
' | while IFS=$'\t' read -r id name mime; do
    if [ "$mime" = "application/vnd.google-apps.folder" ]; then
      download_folder "$id" "$out/$name"
    else
      case "$name" in
        *.pdf|*.jpg|*.jpeg) : ;;  # skip heavy renders except the ones we want
      esac
      echo "  -> $out/$name"
      $GD readonly download "$id" --out "$out/$name" >/dev/null 2>&1 || echo "     (failed: $name)"
    fi
  done
}

download_folder "$1" "$DEST"
