import React from 'react'

import Todo from './Todo'


const TodoList = ({ todos, actions}) => (
    <div className='row'>
        {todos.map(todo => 
            <Todo key={todo.id} todo={todo} {...actions}/>
        )}
    </div>
)



export default TodoList