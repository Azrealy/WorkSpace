// @flow
import * as React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ApiTodoInfoFetch } from '../../ducks/api_todo'
import TodoTableComponent from '../../components/Todo/TodoTable'
import {
	updateTodoButton,
	deleteTodoButton
} from '../../ducks/api_todo'
import { fetchApiTodoList, initializeApiTodoFetch} from '../../ducks/api_todo'

type Props = {
	apiTodos?: Array,
	isFetching: Boolean,
	deleteTodo: Function,
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
					isFetching={this.props.isFetching}
					todos={this.props.apiTodos}
					deleteTodo={this.props.deleteTodo}
					updateTodo={this.props.updateTodo}
				/>
		)
	}
}

const mapStateToProps = (state: { apiTodoListInfo: ApiTodoInfoFetch }) => ({
	isFetching: state.apiTodoListInfo.isFetching,
	apiTodos: state.apiTodoListInfo.apiTodos
})

const mapDipatchToProps = (dispatch: Dispatch) => ({
	deleteTodo(deleteTodoId: number) {
		dispatch(deleteTodoButton(deleteTodoId))
	},
	updateTodo(updateTodoId: number, updateText: string, isCompleted: boolean, comment:string) {
		dispatch(updateTodoButton(updateTodoId, updateText, isCompleted, comment))
	},
	fetchTodoList() {
		dispatch(fetchApiTodoList())
	},
  	initialize() {
		dispatch(initializeApiTodoFetch())
	}
})

TodoTable.propTypes = {
  apiTodos: PropTypes.array,
  deleteTodo: PropTypes.func.isRequired,
	updateTodo: PropTypes.func.isRequired,
	fetchTodoList: PropTypes.func.isRequired
}



export default connect(mapStateToProps, mapDipatchToProps)(TodoTable)