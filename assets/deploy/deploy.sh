#!/usr/bin/env bash

if [[ $DEPLOY_TO_EXCLUSIVE != *"true"* ]] ; then
  echo "Update cdn files"
  ./azcopy sync /payever/ "$MICRO_URL_CUSTOM_STORAGE/cdn/frontend-assets/$STORAGE_BLOB_SAS_KEY" --recursive=true
  echo "Cdn files updated"
fi

if [[ $DEPLOY_TO_EXCLUSIVE == *"true"* ]] ; then
  if [ -d "/etc/nginx/cmconfig" ]; then
    mkdir -p /etc/nginx/conf.d
    sed "s/#INCLUDE_01/rewrite ^\/assets\/(.*)\$ \/assets\/\$1 break;/g" /etc/nginx/cmconfig/default.conf > /etc/nginx/conf.d/default.conf
  fi
  echo -e "\nStarting nginx\n"
  nginx -g 'daemon off;'
fi
