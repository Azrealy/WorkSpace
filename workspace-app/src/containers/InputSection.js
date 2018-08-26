import React from 'react';
import { connect } from 'react-redux';
import { addTodo } from "../actions";


export const AddTodo = ({ dispatch }) => {
    let input

    const handleCreate = (event) => {
        event.preventDefault();
        if (!input.value.trim()){ 
            return
        }
        dispatch(addTodo(input.value))
        input.value = ""
    }
    return (
        <div className="container">
            <h1> Todo List</h1>
            <form onSubmit={handleCreate} className='card p-2'>
                <div className='input-group'>
                    <input type='text'
                        className='form-control'
                        placeholder='What do I need to dosss?'
                        ref={node => {input = node}}
                    />
                    <button type='submit' className="btn btn-primary" > Add task </button>
                </div>
            </form>
        </div>
    )
}

export default connect()(AddTodo)