const todos = (state = [{
    id: 0,
    text: "text",
    completed: false
}], action) => {
    switch(action.type) {
        case 'ADD_TODO':
            return [
                ...state,
                {
                    id: state.reduce((maxId, todo) => Math.max(todo.id, maxId), -1) + 1,
                    text: action.text,
                    completed: false
                }
            ]
            
        case "EDIT_TODO":
            return state.map(todo =>
                todo.id === action.id ?
                    { ...todo, text: action.text } :
                    todo
            )

        case 'DELETE_TODO':
            return state.filter(todo => 
                todo.id !== action.id
            )
        
        case 'TOGGLE_TODO':
             return state.map(todo =>
                (todo.id === action.id)
                    ? {...todo, completed: !todo.completed}
                    : todo
            )
        default:
            return state
    }
}

export default todos