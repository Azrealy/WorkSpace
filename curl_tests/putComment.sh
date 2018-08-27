#!/bin/bash -eu
# Usage: postComment.sh [todo_id, comment]
ENDPOINT=${ENDPOINT:=localhost:8889}

TODOID = ${1:-todo_id}
COMMENT=${2:-comment}

result=$(curl -v -X PUT -d "{ \"comment\": \"${COMMENT}\" }" \
    "${ENDPOINT}/comment/$1")

echo ${result} | jq . || echo ${result}