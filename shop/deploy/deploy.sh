#!/usr/bin/env bash
set -e

envsubst < /payever/deploy/env.json > /payever/env.json

# env replace
printenv | grep -E '^MICRO_URL_'

name_patterns=('.*/index\.html')
sed_pattern=$(printenv | grep -E '^MICRO_URL_' | awk '{sub(/=/," ");$1=$1;print "s#"$1"#"$2"#g;"}')

for name_pattern in "${name_patterns[@]}"; do
    find . -regex "${name_pattern}" | while read filename; do
        echo -e "\nProcessing $filename"

        sed -i "$sed_pattern" ./"$filename"
    done
done

echo -e "\nStarting nginx\n"
nginx -g 'daemon off;'
