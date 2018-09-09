// @flow
import React from 'react'
import PropTypes from 'prop-types'
import { Button, TextArea, List, Icon, Popup, Form } from 'semantic-ui-react'
import './Todo.css'
import { emojiIndex } from 'emoji-mart'

type Props = {
  key: Int,
  todo: Object,
  deleteTodo: Function,
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
      inputValue: this.props.todo.text,
      inputComment: ""
		}
	}
    
	handleEdit = () => {
		this.setState({
    isUpdated: !this.state.isUpdated
		})
	}
  handleChange = (event: Event, data: Object) => {
		event.preventDefault()
    this.setState({
      inputValue: data.value
    })
  }

  handleCommentChange = (event: Event, data: Object) => {
    event.preventDefault()
    this.setState({
      inputComment: data.value
    })
  }
	handleUpdate = () => {
    this.props.updateTodo(
      this.props.todo.id, 
      this.state.inputValue,
      this.props.todo.is_completed,
      this.state.inputComment)
		this.setState({
      isUpdated: true,
      inputComment: ""
		})
	}
	handleCancel = () => {
		this.setState({ isUpdated: true, inputValue: this.props.todo.text })
  }
  
  renderEmoji = (todo:Object) => {
    if (todo.sentiment === '' ) {
      return null
    } else {
        console.log(todo.sentiment)
        const sentiment = 
          todo.sentiment === 'Excited'
            ? 'happy'
            : todo.sentiment
        return (
          <div>{emojiIndex.search(sentiment).map((o) => o.native)}</div>
        )
    }
  }
  renderListHeader = (todo: Object) => {
    if (todo.is_completed) {
      return <List.Header as='s'>{todo.text}</List.Header>
    } else {
      return <List.Header as='h1'>{todo.text}</List.Header>
    }
  }
  renderTextContent = (todo: Object) => {
    return (
      <div>
        <List.Content floated='middle'>
          {this.renderListHeader(todo)}
        </List.Content>
        <List.Content floated='left'>
          <List.Description as='h6'>
            <Icon name='time' color='yellow' />Created at {todo.created_at}
            {this.renderEmoji(this.props.todo)}
          </List.Description>
        </List.Content>
      </div>
    )

  }

  renderFormForUpdate = () => {
    return (
    <Form>
      <Form.Group>
          <Form.Field 
            control={TextArea}
            label='Edit new todo'
            autoFocus value={this.state.inputValue}
            onChange={(e, d) => this.handleChange(e, d)}/>
      </Form.Group>
        <Form.Field
          control={TextArea}
          label='Comment (Analysis your emotion)'
          autoFocus 
          onChange={(e, d) => this.handleCommentChange(e, d)}
          placeholder={this.props.todo.comment} />
      <Form.Field>
          <Button color='red' inverted size="mini" onClick={this.handleUpdate}>
            <Icon name='remove' /> Update
      </Button>
          <Button color='green' size="mini" inverted onClick={this.handleCancel}>
            <Icon name='checkmark' /> Cancel
      </Button>                   
      </Form.Field>
    </Form>
    )
  }

  renderUpdateContent = (todo: Object) => {
      return (
        <div>
          <List.Content floated='right'>
            <Popup
              on='click'
              position='bottom center'
              open={!this.state.isUpdated}
              trigger={           
                    <Button
                      circular
                      fitted
                      size="mini"
                      icon="undo alternate"
                      color='yellow'
                      onClick={this.handleEdit}
                    ></Button>
              }>
            {this.renderFormForUpdate()}
            </Popup>

            <Popup
              content='Delete todo'
              position='bottom center'
              trigger={
                <Button
                  circular
                  fitted
                  size="mini"
                  icon="delete"
                  color='red'
                  onClick={() => this.props.deleteTodo(todo.id)}
                ></Button>
              } />
            <Popup
              content='Complete todo'
              position='bottom center'
              trigger={
                <Button
                  circular
                  fitted
                  size="mini"
                  icon="check"
                  color='green'
                  onClick={() => this.props.updateTodo(todo.id, todo.text, !todo.is_completed)}
                ></Button>
              } />

        </List.Content> 
        </div>
      )
  }
    render() {
      const { todo } = this.props
        return (
          <div>
            {this.renderTextContent(todo)}
            {this.renderUpdateContent(todo)}
          </div>
        )
    };
}

Todo.propTypes = {
	todo: PropTypes.object.isRequired,
	editTodo: PropTypes.func.isRequired,
	deleteTodo: PropTypes.func.isRequired,
  updateTodo: PropTypes.func.isRequired
}

export default Todo