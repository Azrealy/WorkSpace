#!/bin/bash -eu
# Usage: postContainer.sh [container_name]
ENDPOINT=${ENDPOINT:=localhost:8889}

CONTAINERNAME=${1:-container_name}

result=$(curl -v -X POST -d "{ \"container_name\": \"${CONTAINERNAME}\" }" \
    "${ENDPOINT}/container")

echo ${result} | jq . || echo ${result}