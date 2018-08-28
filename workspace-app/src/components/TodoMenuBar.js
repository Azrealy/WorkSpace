// @flow
import React from 'react'
import { Form } from 'semantic-ui-react'
import PropTypes from 'prop-types'


type Props = {
	isCreating: boolean,
	createTodoButton: Function,
	errorMessage: string
}

type State = {
  todoText: string
}

class TodoMenuBar extends React.Component<Props, State> {

	constructor(props: Props) {
    super(props)
    this.state = {
      todoText: ''
    }
  }

	handleCreate(event: Event) {
    event.preventDefault()
    this.props.createTodoButton(this.state.todoText)
  }

	handleInputTodoInfo = (event: Event, data: Object) => {
		event.preventDefault()
		this.setState({todoText: data.value})
	}
	render() {
		return (
		<div>
			<Form>
				<Form.Group>
					<Form.Input
						name="todo-input"
						disabled={this.props.isCreating}
						autoFocus
						width={12}
						error={this.props.errorMessage}
						onChange={(e: Event, d: Object) => this.handleInputTodoInfo(e, d)}
					/>
					<Form.Button content='Submit' onClick={event => this.handleCreate(event)}/>
				</Form.Group>
			</Form>
		</div>
		)
	}
}

TodoMenuBar.propTypes = {
  isCreating: PropTypes.bool.isRequired,
  createTodoButton: PropTypes.func.isRequired,
  errorMessage: PropTypes.func
}
export default TodoMenuBar