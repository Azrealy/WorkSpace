// @flow
import React from 'react'
import { Table, Icon } from 'semantic-ui-react'
import ProgressExampleIndicating from './NotebookProgressBar'

const TableExampleFixed = () => (
  <Table inverted>
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
				<ProgressExampleIndicating/>
				</Table.Cell>
      </Table.Row>
    </Table.Body>
  </Table>
)

export default TableExampleFixed