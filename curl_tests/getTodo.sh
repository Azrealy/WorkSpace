#!/bin/bash -eu
# Usage: getTodo.sh
ENDPOINT=${ENDPOINT:=localhost:8889}

result=$(curl -v -X GET "${ENDPOINT}/todo")

echo ${result} | jq . || echo ${result}