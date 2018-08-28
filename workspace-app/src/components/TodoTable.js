import React from 'react'

import Todo from './Todo'

type Props = {
	todos: Array,
	deleteTodo: Function,
	completeTodo: Function,
	updateTodo: Function
}

class TodoTable extends React.Component<Props>	{
	render() {
		return (
    <div className='row'>
        {this.props.todos.map(todo => 
						<Todo 
							key={todo.todoId}
							todo={todo}
							deleteTodo={this.props.deleteTodo}
							completeTodo={this.props.completeTodo}
							updateTodo={this.props.updateTodo}/>
        )}
    </div>
		)
	}
}


export default TodoTable