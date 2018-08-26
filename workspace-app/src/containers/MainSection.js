import { connect } from 'react-redux'
import * as TodoActions from '../actions'
import { bindActionCreators } from 'redux'
import TodoList from '../component/TodoList'


const mapStateToProps = state => ({
    todos: state.todos
})

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators(TodoActions, dispatch)
})


const MainSection = connect(
    mapStateToProps,
    mapDispatchToProps
)(TodoList)

export default MainSection