#!/usr/bin/env bash
cd "${BASH_SOURCE%/*}/"

envsubst < ./micro.config.json > ./micro.config.json.tmp
mv ./micro.config.json.tmp ./micro.config.json

envsubst < ./env.json > ./env.json.tmp
mv ./env.json.tmp ./env.json

printenv | grep -E '^MICRO_URL_' | while read env_variable; do
    env_name=$(echo $env_variable| cut -d'=' -f 1)
    env_value=$(echo $env_variable| cut -d'=' -f 2)

    echo "$env_name=$env_value"

    find . -name 'runtime.*.js' | while read filename; do
        echo "Processing $filename"
        sed -i "s#$env_name#$env_value#g" ./$filename
    done
done

printenv | grep -E '^MICRO_URL_' | while read env_variable; do
    env_name=$(echo $env_variable| cut -d'=' -f 1)
    env_value=$(echo $env_variable| cut -d'=' -f 2)

    echo "$env_name=$env_value"

    find . -name 'micro.js' | while read filename; do
        echo "Processing $filename"
        sed -i "s#$env_name#$env_value#g" ./$filename
    done
done

printenv | grep -E '^MICRO_URL_' | while read env_variable; do
    env_name=$(echo $env_variable| cut -d'=' -f 1)
    env_value=$(echo $env_variable| cut -d'=' -f 2)

    echo "$env_name=$env_value"

    find . -name 'index.html' | while read filename; do
        echo "Processing $filename"
        sed -i "s#$env_name#$env_value#g" ./$filename
    done
done

/payever/post-deploy.sh

echo "Starting nginx"
nginx -g 'daemon off;'
