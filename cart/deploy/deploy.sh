#!/usr/bin/env bash
set -e

envsubst < /payever/deploy/env.json > /payever/env.json

# env replace
printenv | grep -E '^MICRO_URL_'

echo -e "\nStarting nginx\n"
nginx -g 'daemon off;'
