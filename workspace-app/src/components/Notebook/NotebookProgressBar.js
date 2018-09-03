// @flow
import React from 'react'
import {  Progress, Table, Icon } from 'semantic-ui-react'
import './Notebook.css'

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
    <Table.Cell colSpan="2">
      <Progress 
        percent={percent()}
        indicating
        size='large'
        className="ClusterRow"
        active
        autoSuccess/>
      </Table.Cell>
  </Table.Row>
  )
}

export default NotebookProgress