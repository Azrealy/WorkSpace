#!/bin/bash -eu
# Usage: deleteContainer.sh [container_name]
ENDPOINT=${ENDPOINT:=localhost:8889}

CONTAINERNAME=${1:-container_name}

result=$(curl -v -X DELETE "${ENDPOINT}/container/$1")

echo ${result} | jq . || echo ${result}