import React, { Component } from 'react'
import PropTypes from 'prop-types'

class Todo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isUpdated: true,
            inputValue: this.props.todo.text
        }
    }
    static propTypes = {
        todo: PropTypes.object.isRequired,
        editTodo: PropTypes.func.isRequired,
        deleteTodo: PropTypes.func.isRequired,
        toggleTodo: PropTypes.func.isRequired
    }
    
    handleEdit() {
        this.setState({
            isUpdated: false
        })
    }
    handleChange(event) {
        this.setState({
            inputValue: event.target.value
        })
    }
    handleUpdate() {
        this.props.editTodo(this.props.todo.id, this.state.inputValue)
        this.setState({
            isUpdated: true
        })
    }
    handleCancel() {
        this.setState({ isUpdated: true, inputValue: this.props.todo.text })
    }
    showTask() {
        const { todo, toggleTodo, deleteTodo } = this.props
        console.log(todo)
        var text = '';
        var button = '';
        if (todo.completed) {
            text = <p className='card-text'>
                <s onClick={this.handleEdit.bind(this)}>{todo.text}</s>
            </p>
        } else {
            text =
                <p className='card-text'>
                    <b onClick={this.handleEdit.bind(this)}>{todo.text}</b>
                </p>
        }
        if (this.state.isUpdated) {
            button = <span>
                <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => deleteTodo(todo.id)}
                >Delete</button>
                <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => toggleTodo(todo.id)}
                >Completed</button>
            </span>
        } else {
            text = <p className='card-text'>
                <textarea type="text" value={this.state.inputValue} onChange={this.handleChange.bind(this)} />
                &nbsp;&nbsp;
                       </p>
            button =
                <span>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={this.handleUpdate.bind(this)}
                    >Update</button>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={this.handleCancel.bind(this)}
                    >Cancel</button>
                </span>
        }

        return (
            <div className='card-body'>
                {text}
                <div className="d-flex justify-content-between ">
                    <div className="btn-group">
                        {button}
                    </div>
                </div>
            </div>
        )
    }


    render() {
        return (
            <div className='col-md-4'>
                <div className='card mb-4 box-shadow'>
                    {this.showTask()}
                </div>
            </div>
        )
    };
}

export default Todo