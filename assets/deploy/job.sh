#!/usr/bin/env bash

if [[ $DEPLOY_TO_EXCLUSIVE != *"true"* ]] ; then
    echo "Running deploy.sh"
    /payever/deploy/deploy.sh;
fi

echo -e "\nDone\n"
