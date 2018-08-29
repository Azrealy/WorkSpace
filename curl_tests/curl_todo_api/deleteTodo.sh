#!/bin/bash -eu
# Usage: deleteTodo.sh [todo_id]
ENDPOINT=${ENDPOINT:=localhost:8889}

TODOID=${1:-todo_id}

result=$(curl -v -X DELETE "${ENDPOINT}/todo/${TODOID}")

echo ${result} | jq . || echo ${result}