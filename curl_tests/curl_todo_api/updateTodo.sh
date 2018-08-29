#!/bin/bash -eu
# Usage: updateTodo.sh [todo_id, todo_text]
ENDPOINT=${ENDPOINT:=localhost:8889}

TODOID=${1:-todo_id}

result=$(curl -v -X PUT -d "{ \"text\": \"${TODOTEXT}\"}" \
    "${ENDPOINT}/todo/$1")
echo ${result} | jq . || echo ${result}