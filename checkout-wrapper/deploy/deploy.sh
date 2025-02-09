#!/usr/bin/env bash
set -e

echo "ls /payever"
ls -la /payever

export MICRO_CHECKOUT_VERSION=$(printenv | grep -e '^MICRO_CHECKOUT_VERSION' | sed -e 's/\.//g' | awk '{sub(/=/," ");$1=$1;print $2}')

echo "DEPLOY_TO_EXCLUSIVE=${DEPLOY_TO_EXCLUSIVE}"

if [[ $DEPLOY_TO_EXCLUSIVE == *"true"* && -v EXCLUSIVE_URL ]]; then
  export MICRO_URL_CHECKOUT_CDN="https://${EXCLUSIVE_URL}"
  export MICRO_URL_FRONTEND_CHECKOUT_WRAPPER="https://${EXCLUSIVE_URL}"
  export MICRO_URL_PRIMARY_CHECKOUT="https://${EXCLUSIVE_URL}"
  export MICRO_HOST_FRONTEND_CHECKOUT_WRAPPER="${EXCLUSIVE_URL}"
  export MICRO_HOST_PRIMARY_CHECKOUT="${EXCLUSIVE_URL}"
fi
echo "MICRO_URL_CHECKOUT_CDN=${MICRO_URL_CHECKOUT_CDN}"
echo "MICRO_URL_FRONTEND_CHECKOUT_WRAPPER=${MICRO_URL_FRONTEND_CHECKOUT_WRAPPER}"
echo "MICRO_URL_PRIMARY_CHECKOUT=${MICRO_URL_PRIMARY_CHECKOUT}"
echo "MICRO_HOST_FRONTEND_CHECKOUT_WRAPPER=${MICRO_HOST_FRONTEND_CHECKOUT_WRAPPER}"
echo "MICRO_HOST_PRIMARY_CHECKOUT=${MICRO_HOST_PRIMARY_CHECKOUT}"

envsubst < /payever/deploy/env.json > /payever/env.json
envsubst < /payever/environment.prod.ts > /payever/environment.prod.ts
envsubst < /payever/deploy/micro.config.json > /payever/deploy/micro.config.json.tmp
mv /payever/deploy/micro.config.json.tmp /payever/micro.config.json

echo -e "\nVariables:\n"
printenv | grep -E '^MICRO_URL_'

echo -e "\nVariables to replace in files:\n"
printenv | grep -e '^MICRO_URL_CUSTOM_CDN' -e '^MICRO_URL_FRONTEND_CHECKOUT_WRAPPER' -e '^MICRO_URL_CHECKOUT' -e '^MICRO_URL_PHP_CHECKOUT' -e '^MICRO_URL_CHECKOUT_CDN' -e '^MICRO_URL_THIRD_PARTY_PAYMENTS'

name_patterns=('.*/runtime\(.*\)\.js' '.*/micro\(.*\)\.js' '.*/main\(.*\)\.js' '.*/index\.html')
sed_pattern=$(printenv | grep -e '^MICRO_URL_CUSTOM_CDN' -e '^MICRO_URL_FRONTEND_CHECKOUT_WRAPPER' -e '^MICRO_URL_PHP_CHECKOUT' -e '^MICRO_URL_CHECKOUT_CDN' -e '^MICRO_URL_THIRD_PARTY_PAYMENTS' -e '^MICRO_URL_CUSTOM_STORAGE' | awk '{sub(/=/," ");$1=$1;print "s#"$1"#"$2"#g;"}')
sed_pattern1=$(printenv | grep -e '^MICRO_URL_CHECKOUT' | awk '{sub(/=/," ");$1=$1;print "s#"$1"#"$2"#g;"}')
sed_pattern2=$(printenv | grep -e '^MICRO_CHECKOUT_VERSION' | sed -e 's/\.//g' | awk '{sub(/=/," ");$1=$1;print "s#"$1"#"$2"#g;"}')

checkout_version=$(printenv | grep -e '^MICRO_CHECKOUT_VERSION' | sed -e 's/\.//g' | awk '{sub(/=/," ");$1=$1;print $2}')

for name_pattern in "${name_patterns[@]}"; do
    find . -regex "${name_pattern}" | while read filename; do
        echo -e "\nProcessing $filename"
        size=$(stat -c '%s' $filename || echo "n")
        echo -e "Filesize $size"

        sed -i "$sed_pattern" ./"$filename"
        sed -i "$sed_pattern1" ./"$filename"
        sed -i "$sed_pattern2" ./"$filename"
    done
done

if [[ $DEPLOY_TO_EXCLUSIVE != *"true"* ]] ; then
    echo "Update cdn files"

    ./azcopy sync /payever/en "$MICRO_URL_CUSTOM_STORAGE/cdn/wrapper/en/$checkout_version$STORAGE_BLOB_SAS_KEY" --recursive=true --delete-destination=true
    ./azcopy sync /payever/de "$MICRO_URL_CUSTOM_STORAGE/cdn/wrapper/de/$checkout_version$STORAGE_BLOB_SAS_KEY" --recursive=true --delete-destination=true
    ./azcopy sync /payever/es "$MICRO_URL_CUSTOM_STORAGE/cdn/wrapper/es/$checkout_version$STORAGE_BLOB_SAS_KEY" --recursive=true --delete-destination=true
    ./azcopy sync /payever/da "$MICRO_URL_CUSTOM_STORAGE/cdn/wrapper/da/$checkout_version$STORAGE_BLOB_SAS_KEY" --recursive=true --delete-destination=true
    ./azcopy sync /payever/no "$MICRO_URL_CUSTOM_STORAGE/cdn/wrapper/no/$checkout_version$STORAGE_BLOB_SAS_KEY" --recursive=true --delete-destination=true
    ./azcopy sync /payever/sv "$MICRO_URL_CUSTOM_STORAGE/cdn/wrapper/sv/$checkout_version$STORAGE_BLOB_SAS_KEY" --recursive=true --delete-destination=true
    # ./azcopy sync /payever/dist/finexp "$MICRO_URL_CUSTOM_STORAGE/cdn/wrapper/finexp/$checkout_version$STORAGE_BLOB_SAS_KEY" --recursive=true --delete-destination=true

    ./azcopy copy /payever/en/index.html "$MICRO_URL_CUSTOM_STORAGE/cdn/wrapper/en/index.html$STORAGE_BLOB_SAS_KEY"
    ./azcopy copy /payever/de/index.html "$MICRO_URL_CUSTOM_STORAGE/cdn/wrapper/de/index.html$STORAGE_BLOB_SAS_KEY"
    ./azcopy copy /payever/es/index.html "$MICRO_URL_CUSTOM_STORAGE/cdn/wrapper/es/index.html$STORAGE_BLOB_SAS_KEY"
    ./azcopy copy /payever/da/index.html "$MICRO_URL_CUSTOM_STORAGE/cdn/wrapper/da/index.html$STORAGE_BLOB_SAS_KEY"
    ./azcopy copy /payever/no/index.html "$MICRO_URL_CUSTOM_STORAGE/cdn/wrapper/no/index.html$STORAGE_BLOB_SAS_KEY"
    ./azcopy copy /payever/sv/index.html "$MICRO_URL_CUSTOM_STORAGE/cdn/wrapper/sv/index.html$STORAGE_BLOB_SAS_KEY"
    ./azcopy copy /payever/index.html "$MICRO_URL_CUSTOM_STORAGE/cdn/wrapper/index.html$STORAGE_BLOB_SAS_KEY"
    ./azcopy copy /payever/error.html "$MICRO_URL_CUSTOM_STORAGE/cdn/wrapper/error.html$STORAGE_BLOB_SAS_KEY"

    echo "Cdn files updated"
else
  echo "Nothing to upload to CDN - DEPLOY_TO_EXCLUSIVE=${DEPLOY_TO_EXCLUSIVE}"
fi

if [[ $DEPLOY_TO_EXCLUSIVE == *"true"* ]] ; then
  mkdir "/tmp/$MICRO_CHECKOUT_VERSION"
  cp -rf * "/tmp/$MICRO_CHECKOUT_VERSION/"
  mv "/tmp/$MICRO_CHECKOUT_VERSION" /payever/

  if [ -d "/etc/nginx/cmconfig" ]; then
    mkdir -p /etc/nginx/conf.d
    sed "s/#INCLUDE_01/rewrite ^\/assets\/(.*)\$ \/$MICRO_CHECKOUT_VERSION\/assets\/\$1 break;/g" /etc/nginx/cmconfig/default.conf > /etc/nginx/conf.d/default.conf
  fi

  # Temp download files:
  curl -o /payever/en/polyfills-zonejs-es2015.js https://checkout.payever.org/js/polyfills-zonejs-es2015.js
  curl -o /payever/en/pe-static.js https://checkout.payever.org/js/pe-static.js

  echo -e "\nStarting nginx\n"
  nginx -g 'daemon off;'
fi

apk add nodejs npm
echo "uploading source-maps"
node ./bin/source-map-cli.js sync

echo "Script completed"
