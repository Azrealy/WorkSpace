// @flow
import * as React from 'react'
import NotebookTable from './NotebookTable'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import '../App.css'
import { 
	initialize,
	pollNotebook,
	cancelPollNotebook,
	fetchNotebook
} from '../../ducks/notebook'

type Props = { 
	initialize: Function,
	pollNotebook: Function,
	cancelPollNotebook: Function,
	fetchNotebook: Function
}

class NotebookApp extends React.Component<Props> {

	componentDidMount() {
		this.props.fetchNotebook()
		this.props.pollNotebook()
	}

	componentWillUnmount() {
		this.props.cancelPollNotebook()
		this.props.initialize()
	}

	render() {
		return (
			<div className="Notebook-App">
				<NotebookTable/>
			</div>
		)
	}
}

NotebookApp.propTypes = {
	initialize: PropTypes.func.isRequired,
	fetchNotebook:PropTypes.func.isRequired,
	cancelPollNotebook: PropTypes.func.isRequired,
	pollNotebook: PropTypes.func.isRequired
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  initialize() {
    dispatch(initialize())
  },
  fetchNotebook() {
    dispatch(fetchNotebook())
  },
  pollNotebook() {
    dispatch(pollNotebook())
  },
  cancelPollNotebook() {
    dispatch(cancelPollNotebook())
  }
})
export default connect(null, mapDispatchToProps)(NotebookApp)