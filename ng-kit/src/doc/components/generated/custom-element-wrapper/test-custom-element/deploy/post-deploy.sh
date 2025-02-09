#!/usr/bin/env bash
cd "${BASH_SOURCE%/*}/"

register_microjs() {
    echo -e "> Registering micro.js at ${MICRO_URL_APP_REGISTRY} \n"

    curl --user ${APPREGISTRY_CLIENT_USER}:${APPREGISTRY_CLIENT_PASSWORD} \
        -s -o - -f \
        -X POST \
        -H "Content-Type:application/json" \
        "${MICRO_URL_APP_REGISTRY}/api/apps" -d "@/payever/micro.config.json"

    echo -e "\n"
}

register_translation() {
    local filename="$1"

    echo -e "> Registering translation ${filename} at ${MICRO_URL_PHP_TRANSLATION} \n"

    filename=$(readlink -f "${filename}")

    curl --user ${TRANSLATION_CLIENT_USER}:${TRANSLATION_CLIENT_PASSWORD} \
        -s -o - -f \
        -X POST \
        -H "Content-Type:application/json" \
        "${MICRO_URL_PHP_TRANSLATION}/api/v1/client/units" -d "@$filename"

    echo -e "\n"
}

while true; do
    if register_microjs; then
        echo -e "> Successfully registered micro.js \n"
        break
    fi

    echo -e "> Unable to register micro.js, repeating \n"
    sleep 3
done

find ./translations -name '*.json' | while read filename; do
    if register_translation "${filename}"; then
        echo -e "> Successfully registered translation ${filename} \n"
    else
        echo -e "> Unable to register translation ${filename} \n"
    fi
done
