// @flow
import React from 'react'
import { Table, Icon } from 'semantic-ui-react'
import NotebookProgressComponent from './NotebookProgressBar'

const Notebook = () => (
  <Table color="red">
    <Table.Header>
      <Table.Row >
        <Table.HeaderCell>Name</Table.HeaderCell>
        <Table.HeaderCell>Status</Table.HeaderCell>
        <Table.HeaderCell>Description</Table.HeaderCell>
      </Table.Row>
    </Table.Header>

    <Table.Body>
      <Table.Row verticalAlign="middle">
			<Table.Cell>
				<Icon.Group size='huge'>
				<Icon loading name='cog' />
				<Icon loading corner name='cog' />
			</Icon.Group>
      </Table.Cell>
			<Table.Cell colSpan="2">
          <NotebookProgressComponent/>
				</Table.Cell>
      </Table.Row>
    </Table.Body>
  </Table>
)

export default Notebook