#!/usr/bin/env bash

envsubst < /payever/deploy/env.json > /payever/dist/client/env.json

echo -e "\nVariables:\n"
printenv | grep -E '^MICRO_URL_'

echo -e "\nVariables to replace in files:\n"
printenv | grep -E '^MICRO_URL_CUSTOM_CDN'

name_patterns=('.*/index\.html')
sed_pattern=$(printenv | grep -E '^MICRO_URL_CUSTOM_CDN' | awk '{sub(/=/," ");$1=$1;print "s#"$1"#"$2"#g;"}')

for name_pattern in "${name_patterns[@]}"; do
    find . -regex "${name_pattern}" | while read filename; do
        echo -e "\nProcessing $filename"

        sed -i "$sed_pattern" ./"$filename"
    done
done

set -e

node /payever/dist/server/consumer.js
