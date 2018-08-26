import * as actions from "./index";

describe('todo actions', () => {
    it('addTodo should create ADD_TODO action', () => {
        expect(actions.addTodo('Use Redux')).toEqual({
            type: 'ADD_TODO',
            id: 0,
            text: 'Use Redux'
        })
    })

    it('deleteTodo should create DELETE_TODO action', () => {
        expect(actions.deleteTodo(1)).toEqual({
            type: 'DELETE_TODO',
            id: 1
        })
    })

    it('toggleTodo should create TOGGLE_TODO action', () => {
        expect(actions.toggleTodo(1)).toEqual({
            type: 'TOGGLE_TODO',
            id: 1
        })
    })

    it('editTodo should create EDIT_TODO action', () => {
        expect(actions.editTodo(1, "Fix the text")).toEqual({
            type: 'EDIT_TODO',
            id: 1,
            text: "Fix the text"
        })
    })
})