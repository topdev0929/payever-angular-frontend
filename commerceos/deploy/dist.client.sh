#!/usr/bin/env bash
echo -e "// Replace ENV vaiables \n"

envsubst < /payever/deploy/env.json > /payever/dist/browser/env.json

echo -e "\nVariables:\n"
printenv | grep -E '^MICRO_URL_'

echo -e "\nVariables to replace in files:\n"
printenv | grep -E '^MICRO_URL_CUSTOM_CDN'

name_patterns=('.*/index\.html')
sed_pattern=$(printenv | grep -e '^MICRO_URL_CUSTOM_CDN' | sed -e 's/\./\./g' | awk '{sub(/=/," ");$1=$1;print " -e s#"$1"#"$2"#g"}')
sed_pattern+=$(printenv | grep -e 'BUILDER_VERSION' | sed -e 's/\.//g' | awk '{sub(/=/," ");$1=$1;print " -e s#"$1"#"$2"#g"}')

echo $sed_pattern >> /payever/log.log

for name_pattern in "${name_patterns[@]}"; do
    find . -regex "${name_pattern}" | while read filename; do
        echo -e "\nProcessing $filename"

        sed -i $sed_pattern ./$filename
        echo $filename >> /payever/log.log
    done
done

echo -e "// Copy dist files \n"
cp -r /payever/. /dist && echo -e "done\n"
