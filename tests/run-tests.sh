#!/usr/bin/env bash
# ============================================================
#  Glimt – kjør automatiske tester lokalt
# ============================================================
#
#  Starter en lokal webserver på port 8765 og åpner testsiden
#  i standard-nettleseren. Testene kjører mot ekte Firestore
#  (samme database som appen), så du må være logget inn.
#
#  Bruk:  bash tests/run-tests.sh
#  Stopp: Ctrl+C i terminalen
# ============================================================

set -e

cd "$(dirname "$0")/.."
PORT=8765
URL="http://localhost:${PORT}/tests/test-glimt-store.html"

echo "→ Starter lokal server på port ${PORT} …"
echo "→ Test-side: ${URL}"
echo "→ Stopp med Ctrl+C"
echo ""

# Åpne nettleseren etter kort forsinkelse (kjør i bakgrunnen)
(sleep 1 && (open "${URL}" 2>/dev/null || xdg-open "${URL}" 2>/dev/null || \
  echo "Åpne manuelt: ${URL}")) &

# Start server (blokkerer til Ctrl+C)
python3 -m http.server ${PORT}
