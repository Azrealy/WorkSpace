// @flow
import React from 'react'
import { Table, Icon } from 'semantic-ui-react'
import './Notebook.css'
import { ProgressBar } from 'react-bootstrap';

const NotebookProgress = (props) => {

  const {container} = props
  
  const percent = () => {
    if (container.status === 'creating' || !container.health) {
      return 25
    } else if (container.health === 'starting') {
      return 55
    } else if (container.health === 'unhealthy') {
      return 80
    } else {
      return 100
    }
  }

  return (
    <Table.Row verticalAlign="middle">
      <Table.Cell>
        <Icon.Group size='huge'>
          <Icon loading name='cog' />
          <Icon loading corner name='cog' />
        </Icon.Group>
      </Table.Cell>
    <Table.Cell colSpan="3">
      <ProgressBar now={percent()} label={`${percent()}%`} active />
      </Table.Cell>
  </Table.Row>
  )
}

export default NotebookProgress