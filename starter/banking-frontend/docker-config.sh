#!/bin/sh
# Generates the runtime configuration of the e-banking from environment variables.
set -eu
cat > /usr/share/nginx/html/config.js <<CONFIG
window.TRUSTROOM_CONFIG = {
  apiUrl: "${API_URL}",
  trustroomUrl: "${TRUSTROOM_URL}",
};
CONFIG
echo "e-banking config: apiUrl=${API_URL} trustroomUrl=${TRUSTROOM_URL:-<placeholder>}"
