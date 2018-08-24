#!/bin/bash -eu
# Usage: deleteContainer.sh [container_name]
ENDPOINT=${ENDPOINT:=localhost:8889}

CONTAINERNAME=${1:-container_name}

result=$(curl -v -X DELETE -d "{ \"container_name\": \"${CONTAINERNAME}\" }" \
    "${ENDPOINT}/container")

echo ${result} | jq . || echo ${result}