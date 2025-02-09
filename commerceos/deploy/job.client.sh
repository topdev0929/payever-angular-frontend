#!/usr/bin/env bash


name_patterns=('.*/.*\.js')
sed_pattern=$(printenv | grep -e '^MICRO_CHECKOUT_VERSION' | sed -e 's/\.//g' | awk '{sub(/=/," ");$1=$1;print " -e s#"$1"#"$2"#g"}')
sed_pattern+=$(printenv | grep -e '^MICRO_COMMERCEOS_VERSION' | sed -e 's/\.//g' | awk '{sub(/=/," ");$1=$1;print " -e s#"$1"#"$2"#g"}')
sed_pattern+=$(printenv | grep -e '^MICRO_URL_CUSTOM_CDN' | sed -e 's/\./\./g' | awk '{sub(/=/," ");$1=$1;print " -e s#"$1"#"$2"#g"}')
sed_pattern+=$(printenv | grep -e 'BUILDER_VERSION' | sed -e 's/\.//g' | awk '{sub(/=/," ");$1=$1;print " -e s#"$1"#"$2"#g"}')
for name_pattern in "${name_patterns[@]}"; do
    find . -regex "${name_pattern}" -not -path "./node_modules/*" | while read filename; do
        echo -e "\nProcessing $filename"
        sed -i $sed_pattern ./$filename
    done
done


builder_version=$(printenv | grep -e '^BUILDER_VERSION' | sed -e 's/\.//g' | awk '{sub(/=/," ");$1=$1;print $2}')
echo $builder_version

./azcopy sync ./dist/peb-client/browser/ "$MICRO_URL_CUSTOM_STORAGE/cdn/builder-client/$builder_version/$STORAGE_BLOB_SAS_KEY" --recursive=true
