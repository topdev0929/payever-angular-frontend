#!/usr/bin/env bash

# Translation keys push

# find ./translations -name '*.json' | while read filename; do
#     domain_locale=$(basename "${filename}" | sed "s/.json//g;")
#     filename=$(readlink -f "${filename}")

#     echo -e "> Registering translation ${domain_locale} at ${MICRO_URL_PHP_TRANSLATION} \n"

#     curl --user ${TRANSLATION_CLIENT_USER}:${TRANSLATION_CLIENT_PASSWORD} \
#         --silent --output - --show-error --fail \
#         --connect-timeout 3 \
#         --max-time 5 \
#         -X POST \
#         -H "Content-Type:application/json" \
#         "${MICRO_URL_PHP_TRANSLATION}/api/translation/${domain_locale}" -d "@$filename"

#     echo -e "\n"
# done

# echo -e "\nDone Translation keys push\n"
