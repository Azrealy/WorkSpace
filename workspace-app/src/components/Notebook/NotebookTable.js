// @flow
import React from 'react'
import { Table, Icon, Button, Header, Form, Popup, Label, Message, Input } from 'semantic-ui-react'
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

  renderErrorMessage = () => {
    console.log(this.props.messages)
		if (this.props.messages.length !== 0) {
			return (
				<Message error>
					<Message.Header>
						There was some errors with your server or requests
					</Message.Header>
					<p>{this.props.messages.message}</p>
				</Message>
			)
    } else  {
      return null
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
        <Table.Cell positive>
          <Header as='h3' textAlign='center'>
            {this.props.container.health}
          </Header>
          <Label>Created at {this.props.container.created_at}</Label>
        </Table.Cell >
        <Table.Cell textAlign='center'>
        <Header>
        <a href={url} target="_blank">Jupyter Notebook </a> <br/>
        </Header>

        <Input
              size="mini"
              type="text"
              id='new-api-token'
              readOnly
              position="bottom left"
              labelPosition="left"
              label={
                <Popup
                  on="click"
                  size="mini"
                  trigger={
                    <Button
                      id={`copy-jupyter-token`}
                      icon="clipboard"
                      attached="left"
                      className="copy"
                      data-clipboard-target={`#new-api-token`}
                    />
                  }
                  content='Copy to Clipboard'
                  />}
            value={token}
            />

          </Table.Cell>
          <Table.Cell>
            <Header/>
          <Button 
            size="mini"
            primary
            disabled={this.state.isDeleting}
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
      <Table.Cell colSpan="4">
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
            disabled={this.props.messages.length === 0 ? false: true}
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
    console.log(this.props.container)
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
      <Table color="red" celled padded>
        <Table.Header>
          <Table.Row >
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell>Description</Table.HeaderCell>
            <Table.HeaderCell>Operation</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body >
          {this.renderTableBody()}
          {this.renderErrorMessage()}
        </Table.Body>
      </Table>

    )
  }
}

export default NotebookTable