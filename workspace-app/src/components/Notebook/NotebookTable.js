// @flow
import React from 'react'
import { Table, Icon, Button, Header, Form, Popup, Label } from 'semantic-ui-react'
import NotebookProgressComponent from './NotebookProgressBar'
import Clipboard from 'clipboard'

class NotebookTable extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      isCreating: false,
      isDeleting: false,
      name: ''
    }
  }

  completeProgress = () => {
    this.setState({ isCreating: false })
  }

  renderLoading = () => {
    return (
      <Table.Row>
        <Table.Cell colSpan="3">
          <Icon loading name="spinner" />Loading...
        </Table.Cell>
      </Table.Row>
    )
  }

  creatingButton = () => {
    this.setState({isCreating: true, isDeleting: false})
    this.props.createNotebook(this.state.name)
  }

  deletingButton = () => {
    this.setState({ isDeleting: true, isCreating: false})
    this.props.deleteNotebook(this.props.container.container_name)
  }

  renderCreatedView = () => {
    new Clipboard('.copy') // eslint-disable-line no-new
    const url = this.props.container.jupyter_url
    const token = this.props.container.jupyter_token
    return (
      <Table.Row verticalAlign="middle">
        <Table.Cell>
          <Icon.Group size='huge'>
            <Icon name='docker' />
            <Icon loading corner name='cog' />
          </Icon.Group>
        </Table.Cell>
        <Table.Cell>
          <Header as='h2' textAlign='center'>
            {this.props.container.health}
          </Header>
        </Table.Cell>
        <Table.Cell>
          <Popup
            on="click"
            size="mini"
            trigger={
              <Button
                size="mini"
                id={`copy-jupyter-token`}
                icon="clipboard"
                attached="left"
                className="copy"
                data-clipboard-target={`#new-api-token`}
              />
            }
            content='Copy to Clipboard'
          />
          <Label id='new-api-token'>
            {url+'/?token='+token}
          </Label>
          <Button 
            size="mini"
            primary
            loading={this.state.isDeleting}
            content='DELETE'
            icon='delete'
            labelPosition='left'
            onClick={this.deletingButton}
            />
        </Table.Cell>
    </Table.Row>
    )
  }

	handleInputContainerName = (event: Event, data: Object) => {
		event.preventDefault()
		this.setState({name: data.value})
	}

  renderBasicView = () => (
    <Table.Row verticalAlign="left">
      <Table.Cell colSpan="3">
        <Form loading={this.state.isCreating}> 
          <Form.Input
            autofocus
            label='Container Name'
            placeholder='jupyter notebook container'
            onChange={(e, d) => this.handleInputContainerName(e, d)}
            />
          <Form.Button
            size="mini"
            primary
            loading={this.state.isCreating}
            floated='right'
            content='Create'
            icon='play'
            labelPosition='left'
            onClick={this.creatingButton} 
            />
        </Form>
      </Table.Cell>
    </Table.Row>
  )

  renderTableBody = () => {
    if (this.props.isFetching) {
      return this.renderLoading()
    } else if (this.props.container === null) {
      return this.renderBasicView()
    } else if (this.props.container.health === 'healthy'){
      return this.renderCreatedView()
    } else {
      return <NotebookProgressComponent container={this.props.container}/>
    }
  }

  render() {
    return (
      <Table color="red">
        <Table.Header>
          <Table.Row >
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell>Description</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {this.renderTableBody()}
        </Table.Body>
      </Table>

    )
  }
}

export default NotebookTable