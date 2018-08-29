// @flow
import React from 'react'
import { Form, Message } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import './Todo.css';


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

	renderErrorMessage = () => {
	
		if (this.props.errorMessage !== '') {
			return (
				<Message error>
					<Message.Header>
						There was some errors with your server or requests
					</Message.Header>
					<p>{this.props.errorMessage}</p>
				</Message>
			)
		}
	}
	render() {
		return (
		<div>
			<Form className="todoApp">
				<Form.Group>
					<Form.Input
						name="todo-input"
						disabled={this.props.isCreating}
						autoFocus
						width={15}
						error={this.props.errorMessage}
						onChange={(e: Event, d: Object) => this.handleInputTodoInfo(e, d)}
					/>
					<Form.Button content='Submit' onClick={event => this.handleCreate(event)}/>
				</Form.Group>
			</Form>
			{this.renderErrorMessage()}
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