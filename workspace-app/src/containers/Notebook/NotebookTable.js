// @flow
import * as React from 'react'
import NotebookTableComponent from '../../components/Notebook/NotebookTable'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import '../App.css'
import {
	createNotebook,
	deleteNotebook,
	fetchNotebook,
} from '../../ducks/notebook'

type Props = {
	container: Container,
	isFetching: boolean,
	showDeleteConfirmTargetnotebook: notebookName,
	messages: Array<{ type: string, messages: string}>,
	createNotebook: Function,
	deleteNotebook: Function,
	fetchNotebook: Function
}

class NotebookTable extends React.Component<Props> {

	render() {
		return (
			<div className="Notebook-App">
				<NotebookTableComponent
					container={this.props.container}
					isFetching={this.props.isFetching}
					showDeleteConfirmTargetnotebook={this.props.showDeleteConfirmTargetnotebook}
					messages={this.props.messages}
					createNotebook={this.props.createNotebook}
					deleteNotebook={this.props.deleteNotebook}
					fetchNotebook={this.props.fetchNotebook}
					/>
			</div>
		)
	}
}

NotebookTable.propTypes = {
  container: PropTypes.object.isRequired,
  isFetching: PropTypes.bool.isRequired,
  showDeleteConfirmTargetnotebook: PropTypes.string.isRequired,
	messages: PropTypes.array.isRequired,
	createNotebook: PropTypes.func.isRequired,
	deleteNotebook: PropTypes.func.isRequired,
	fetchNotebook: PropTypes.func.isRequired
}

const mapStateToProps = (state: { containerInfo: notebookState }) => ({
  container: state.containerInfo.container,
  isFetching: state.containerInfo.isFetching,
  showDeleteConfirmTargetnotebook: state.containerInfo.showDeleteConfirmTargetnotebook,
	messages: state.containerInfo.messages
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  createNotebook(containerName: string) {
    dispatch(createNotebook(containerName))
  },
  deleteNotebook(containerName: string) {
    dispatch(deleteNotebook(containerName))
	},
	fetchNotebook() {
    dispatch(fetchNotebook())
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(NotebookTable)