#!/bin/bash -eu
# Usage: updateTodo.sh [todo_id, todo_text]
ENDPOINT=${ENDPOINT:=localhost:8889}

TODOID=${1:-todo_id}
TODOTEXT=${2:-TEST}
ISCOMPLETED=${3}
COMMENT=${4}

result=$(curl -v -X PUT -d "{ \"text\": \"${TODOTEXT}\", \"is_completed\": \"${ISCOMPLETED}\", \"comment\": \"${COMMENT}\" }" \
    "${ENDPOINT}/todo/$1")
echo ${result} | jq . || echo ${result}