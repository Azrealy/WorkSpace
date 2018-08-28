// @flow
import React from 'react'
import PropTypes from 'prop-types'
import { Button, Card } from 'semantic-ui-react'


type Props = {
  key: Int,
  todo: Object,
  deleteTodo: Function,
  completeTodo: Function,
  updateTodo: Fuction
}
  
type State = {
  isUpdated: string,
	inputValue: string
}

class Todo extends React.Component<Props, State> {
	constructor(props) {
		super(props);
		this.state = {
			isUpdated: true,
			inputValue: this.props.todo.text
		}
	}
    
	handleEdit() {
		this.setState({
			isUpdated: false
		})
	}
  handleChange = (event: Event, data: Object) => {
		event.preventDefault()
    this.setState({
      inputValue: data.value
    })
  }
	handleUpdate() {
		this.props.updateTodo(this.props.todo.todoId, this.state.inputValue)
		this.setState({
			isUpdated: true
		})
	}
	handleCancel() {
		this.setState({ isUpdated: true, inputValue: this.props.todo.text })
	}
  showTask() {
    const { todo, completeTodo, deleteTodo } = this.props
    console.log(todo)
    var text = '';
    var button = '';
    if (todo.isCompleted) {
      text = <p className='card-text'>
      				<s onClick={this.handleUpdate.bind(this)}>{todo.text}</s>
      			</p>
    } else {
      text =<p className='card-text'>
        			<b onClick={this.handleUpdate.bind(this)}>{todo.text}</b>
      			</p>
        }
    if (this.state.isUpdated) {
      button = <span>
        					<Button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => deleteTodo(todo.todoId)}
                	>Delete</Button>
                <Button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => completeTodo(todo.todoId)}
                >Completed</Button>
            </span>
    } else {
      text = <p className='card-text'>
          		<textarea type="text" value={this.state.inputValue} onChange={this.handleChange.bind(this)} />
                &nbsp;&nbsp;
                       </p>
            button =
                <span>
                    <Button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={this.handleUpdate.bind(this)}
                    >Update</Button>
                    <Button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={this.handleCancel.bind(this)}
                    >Cancel</Button>
                </span>
        }

        return (
            <Card.Content>
                {text}
                <div className='ui two buttons'>
                  {button}
                </div>
            </Card.Content>
        )
    }


    render() {
        return (
            <Card>
              {this.showTask()}
            </Card>
        )
    };
}

Todo.propTypes = {
	todo: PropTypes.object.isRequired,
	editTodo: PropTypes.func.isRequired,
	deleteTodo: PropTypes.func.isRequired,
	toggleTodo: PropTypes.func.isRequired
}

export default Todo