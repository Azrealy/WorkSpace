// @flow
import * as React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
	postApiTodo,
	ApiTodoInfoPost,
	initializeApiTodoPost,
} from '../ducks/post_todo_api'
import TodoMenuBarComponent from '../components/TodoMenuBar'

type Props = {
	initialize: Function,
	isCreating: boolean,
	createTodo: Function,
	errorMessage: string
}

class TodoMenuBar extends React.PureComponent<Props> {
	componentDidMount() {
		this.props.initialize()
	}

	render() {
		return (
			<TodoMenuBarComponent
				createTodoButton={this.props.createTodo}
				isCreating={this.props.isCreating}
				errorMessage={this.props.errorMessage}
			/>
		)
	}
}

const mapStateToProps = (state: { todoPostInfo: ApiTodoInfoPost}) => ({
	isCreating: state.todoPostInfo.isCreating,
	errorMessage: state.todoPostInfo.errorMessage
})

const mapDipatchToProps = (dispatch: Dispatch) => ({
	initialize() {
		dispatch(initializeApiTodoPost())
	},
	createTodo(text: string) {
		dispatch(postApiTodo(text))
	},
})

TodoMenuBar.propTypes = {
	initialize: PropTypes.func.isRequired,
  isCreating: PropTypes.bool.isRequired,
  createTodo: PropTypes.func.isRequired,
  errorMessage: PropTypes.string
}


export default connect(mapStateToProps, mapDipatchToProps)(TodoMenuBar)