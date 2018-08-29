// @flow
import * as React from 'react'
import { Container, Divider } from 'semantic-ui-react'
import TodoMenuBar from './TodoMenuBar'
import TodoTable from './TodoTable'


class TodoApp extends React.PureComponent<Props> {

	render() {
		return (
				<Container className="main-todoApp">
					<TodoMenuBar/>
					<Divider/>
					<TodoTable/>
				</Container>
		)
	}
}

export default TodoApp