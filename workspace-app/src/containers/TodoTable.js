// @flow
import * as React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ApiTodoInfoFetch } from '../ducks/api_todo'
import TodoTableComponent from '../components/TodoTable'
import {
	completeTodoButton,
	updateTodoButton,
	deleteTodoButton
} from '../ducks/api_todo'
import { fetchApiTodoList, initializeApiTodoFetch} from '../ducks/api_todo'

type Props = {
	apiTodos: Array,
	deleteTodo: Function,
	completeTodo: Function,
	updateTodo: Function,
	fetchTodoList: Function,
	initialize: Function
}

class TodoTable extends React.PureComponent<Props> {
	componentDidMount() {
		this.props.initialize()
		this.props.fetchTodoList()
	}
	render() {
		return (
				<TodoTableComponent
					todos={this.props.apiTodos}
					deleteTodo={this.props.deleteTodoButton}
					completeTodo={this.props.completeTodoButton}
					updateTodo={this.props.updateTodoButton}
				/>
		)
	}
}

const mapStateToProps = (state: { apiTodoListInfo: ApiTodoInfoFetch }) => ({
	apiTodos: state.apiTodoListInfo.apiTodos
})

const mapDipatchToProps = (dispatch: Dispatch) => ({
	deleteTodo(deleteTodoId: string) {
		dispatch(deleteTodoButton(deleteTodoId))
	},
	completeTodo(completeTodoId: string) {
		dispatch(completeTodoButton(completeTodoId))
	},
	updateTodo(updateTodoId: string, updateText: string) {
		dispatch(updateTodoButton(updateTodoId, updateText))
	},
	fetchTodoList() {
		dispatch(fetchApiTodoList())
	},
  initialize() {
		dispatch(initializeApiTodoFetch())
	}
})

TodoTable.propTypes = {
  apiTodos: PropTypes.array.isRequired,
  deleteTodo: PropTypes.func.isRequired,
  completeTodo: PropTypes.func.isRequired,
	updateTodo: PropTypes.func.isRequired,
	fetchTodoList: PropTypes.func.isRequired
}



export default connect(mapStateToProps, mapDipatchToProps)(TodoTable)