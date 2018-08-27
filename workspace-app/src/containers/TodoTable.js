// @flow
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ApiTodoInfoFetch } from '../ducks/api_todo'
import {
	completeTodoButton,
	updateTodoButton,
	deleteTOdoButton
} from '../ducks/api_todo'

type Props = {
	todos: Array,
	deleteTodo: Function,
	completeTodo: Function,
	updateTodo: Function
}

const TodoTable = (props: Props) => {
	<TodoComponent
		todos={props.apiTodos}
		deleteTOdoButton={props.deleteTodo}
		completeTodoButton={props.completeTodo}
		updateTodoButton={props.updateTodo}
	/>
}

const mapStateToProps = (state: { apiTodoListInfo: ApiTodoInfoFetch }) => ({
	todos: state.apiTodos
})

const mapDipatchToProps = (dispatch: Dispatch) => ({
	deleteTodo(deleteTodoId: string) {
		dispatch(deleteTOdoButton(deleteTodoId))
	},
	completeTodo(completeTodoId: string) {
		dispatch(completeTodoButton(completeTodoId))
	},
	updateTodo(updateTodoId: string, updateText: string) {
		dispatch(updateTodoButton(updateTodoId, updateText))
	}

})

TodoTable.propTypes = {
  todos: PropTypes.array.isRequired,
  deleteTodo: PropTypes.func.isRequired,
  completeTodo: PropTypes.func.isRequired,
  updateTodo: PropTypes.func.isRequired,
}



export default connect(mapStateToProps, mapDipatchToProps)(TodoTable)