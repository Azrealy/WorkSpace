#!/bin/bash -eu
# Usage: getContainer.sh
ENDPOINT=${ENDPOINT:=localhost:8889}

result=$(curl -v -X GET "${ENDPOINT}/container")

echo ${result} | jq . || echo ${result}