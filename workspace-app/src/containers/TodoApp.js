// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Container } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import TodoMenuBar from './TodoMenuBar'
import TodoTable from './TodoMenuBar'
import { initializeApiTodoFetch, fetchApiTodoList} from '../ducks/api_todo'
import { Dispatch } from '../../../../../.cache/typescript/2.9/node_modules/redux';

type Props = {
	initialize: Function,
  fetchTodoList: Function,
}

class TodoApp extends Component<Props> {
    componentDidMount() {
			this.props.fetchTodoList()
		}
		componentWillUnmount() {
			this.props.initialize()
		}
		render() {
			return (
				<Container className="main-todo">
					<TodoMenuBar/>

				</Container>
			)
		}
}

TodoApp.propTypes = {
	initialize: PropTypes.func.isRequired,
	fetchTodoList: PropTypes.func.isRequired
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  initialize() {
		dispatch(initializeApiTodoFetch())
	},
	fetchTodoList() {
		dispatch(fetchApiTodoList())
	}
})

export default connect(
  null,
  mapDispatchToProps
)(TodoApp)