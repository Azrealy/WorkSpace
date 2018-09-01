#!/bin/bash -eu
# Usage: createTodo.sh [todo_text]
ENDPOINT=${ENDPOINT:=localhost:8889}

TODOTEXT=${1:-todo_text}

result=$(curl -v -X POST -d "{ \"text\": \"${TODOTEXT}\"}" \
    "${ENDPOINT}/todo")

echo ${result} | jq . || echo ${result}