#!/bin/bash

#KEYVAULT_PROXY_URL=http://127.0.0.1:8000
KEYVAULT_PROXY_URL=https://test1-keyvault-proxy.devpayever.com/
ENV_PATH=.env
DEFAULT_SECRET_NAME=frontend-commerceos-testing-dot-env

help() {
	echo "Usage:"
	echo "$0 [secret-name] [key-vault-proxy-url]"
	echo
	echo "Without a secret name provided the default '$DEFAULT_SECRET_NAME' will be used"
	echo
	exit 0;
}

if [ -z "$1" ]
then
	# No secret name supplied, use default
	SECRET_NAME=$DEFAULT_SECRET_NAME
	echo "Use default secret name '$SECRET_NAME'"
elif [[ "$1" == "-h" || "$1" == "help" ]]
then
	help
else
	SECRET_NAME=$1
	echo "Use secret name '$SECRET_NAME'"
fi

if [ ! -z "$2" ]
then
	KEYVAULT_PROXY_URL=$2
fi

unset username
unset password

echo -n "Enter LDAP Username: "
read username
read -s -p "Password: " password
echo

echo "Read '$SECRET_NAME' from $KEYVAULT_PROXY_URL as $username"
OUT=$(curl -s -k -X POST -d "username=$username" -d "password=$password" \
	$KEYVAULT_PROXY_URL/keyvault/secret/show/$SECRET_NAME)

if [[ $OUT =~ ^Error* ]];
then
	echo "Something went wrong: $OUT"
elif [[ -z "$OUT" ]];
then
	echo "Something went wrong. Empty output."
else
	if [ -e $ENV_PATH ]; then
		mv $ENV_PATH $ENV_PATH.bak
		echo "Old '$ENV_PATH' moved to $ENV_PATH.bak"
	fi
	printf "$OUT" > $ENV_PATH
	echo "File '$ENV_PATH' created."
fi
