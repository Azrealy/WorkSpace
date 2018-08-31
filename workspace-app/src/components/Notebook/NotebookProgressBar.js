// @flow
import React, { Component } from 'react'
import { Button, Progress, Table, Icon } from 'semantic-ui-react'
import './Notebook.css'

class NotebookProgress extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      percent: 0
    }
  }

  componentWillMount() {
    if (this.props.container.state !== 'running' || this.props.container.health !== 'healthy') {
      this.setState({percent: 25})
    } else if (this.props.container.state === 'running') {
      this.setState({percent: 50})
    } else if (this.props.container.health === 'healthy') {
      this.setState({percent: 70})
    }
    this.setState({percent: 100})
    this.props.completeProgress()
  }

  render() {
    return (
      <Table.Row verticalAlign="middle">
        <Table.Cell>
          <Icon.Group size='huge'>
            <Icon loading name='cog' />
            <Icon loading corner name='cog' />
          </Icon.Group>
        </Table.Cell>
      <Table.Cell colSpan="2">
        <Progress 
          percent={this.state.percent}
          indicating
          size='large'
          className="ClusterRow"
          active
          autoSuccess/>
        </Table.Cell>
    </Table.Row>
    )
  }
}

export default NotebookProgress