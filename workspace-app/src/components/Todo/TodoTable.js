// @flow
import * as R from 'ramda'
import React from 'react'
import { Menu} from 'semantic-ui-react'
import Todo from './Todo'
import './Todo.css';
import PropTypes from 'prop-types'


type Props = {
	todos: Array,
	deleteTodo: Function,
	updateTodo: Function
}

class TodoTable extends React.Component<Props>	{
	constructor(props) {
		super(props);
		this.state = {
			activeItem: 'all'
		} 
	}
	renderNoTodoList = () => {
		return <h1>No todo exist.</h1>
	}

	renderTodoList = (todo: Object, idx: number) => {
		return (
				<Todo 
					key={idx}
					todo={todo}
					deleteTodo={this.props.deleteTodo}
					updateTodo={this.props.updateTodo}/>
		)
	}
	handleItemClick = (e, {name}) => {
		this.setState({ activeItem: name })
	}
	menuOfVisibility = () => {
		const { activeItem } = this.state
		return (
				<Menu fluid inverted widths={3}>
					<Menu.Item name='all' active={activeItem === 'all'} onClick={this.handleItemClick} />
					<Menu.Item name='completed' active={activeItem === 'completed'} onClick={this.handleItemClick} />
					<Menu.Item name='active' active={activeItem === 'active'}  onClick={this.handleItemClick} />
				</Menu>
		)
	}

	filterTodo = () => {
		if (this.state.activeItem === 'all') {
			return this.props.todos
		} else if (this.state.activeItem === 'completed') {
			return R.filter(todo => todo.is_completed === 1, this.props.todos)
		} else if (this.state.activeItem === 'active') {
			return R.filter((todo) => todo.is_completed === 0, this.props.todos)
		}
	}

  renderTodoListBody = () => {
    if (this.props.todos === null) {
      return this.renderNoTodoList()
    } else {
			const todos = this.filterTodo()
			const mapIndexed = R.addIndex(R.map)
			return mapIndexed(
				(todo: Object, idx: number) => this.renderTodoList(todo, idx),
				R.values(todos)
			)
	}
  }

	render() {
		return (
		<div className>
    	<div className>
				{this.menuOfVisibility()}
				{this.renderTodoListBody()}
    	</div>
		</div>
		)
	}
}

TodoTable.propTypes = {
	todos: PropTypes.array,
  deleteTodo: PropTypes.func.isRequired,
	updateTodo: PropTypes.func.isRequired,
}

export default TodoTable