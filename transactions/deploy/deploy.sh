#!/usr/bin/env bash
set -e

envsubst < /payever/deploy/env.json > /payever/env.json

echo -e "\nVariables:\n"
printenv | grep -E '^MICRO_URL_'

echo -e "\nVariables to replace in files:\n"
printenv | grep -e '^MICRO_URL_FRONTEND_TRANSACTIONS'

name_patterns=('.*/runtime\(.*\)\.js' '.*/micro\(.*\)\.js' '.*/index\.html')
sed_pattern=$(printenv | grep -e '^MICRO_URL_FRONTEND_TRANSACTIONS' | awk '{sub(/=/," ");$1=$1;print "s#"$1"#"$2"#g;"}')

for name_pattern in "${name_patterns[@]}"; do
    find . -regex "${name_pattern}" | while read filename; do
        echo -e "\nProcessing $filename"

        sed -i "$sed_pattern" ./"$filename"
    done
done

echo -e "\nStarting nginx\n"
nginx -g 'daemon off;'
