// @flow
import * as React from 'react'
import { connect } from 'react-redux'
import { Container } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import TodoMenuBar from './TodoMenuBar'
import TodoTable from './TodoTable'
import { initializeApiTodoFetch} from '../ducks/api_todo'
import { Dispatch } from '../../../../../.cache/typescript/2.9/node_modules/redux';

type Props = {
	initialize: Function
}

class TodoApp extends React.PureComponent<Props> {

		componentDidMount() {
			this.props.initialize()
		}
		render() {
			return (
					<Container className="main-todoApp">
						<TodoMenuBar/>
						<TodoTable/>
					</Container>
			)
		}
}

TodoApp.propTypes = {
	initialize: PropTypes.func.isRequired,
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  initialize() {
		dispatch(initializeApiTodoFetch())
	}
})

export default connect(
  null,
  mapDispatchToProps
)(TodoApp)