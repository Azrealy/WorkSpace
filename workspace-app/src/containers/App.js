// @flow
import * as React from 'react'
import Header from '../components/Header/Header'
import './App.css'
import{ Link } from "react-router";
import {  Icon, Menu, Segment, Sidebar } from 'semantic-ui-react'

export default class App extends React.PureComponent {
	state = { visible: false }

	handleButtonClick = () => this.setState({ visible: !this.state.visible })

	handleSidebarHide = () => this.setState({ visible: false })

	render() {
		const { visible } = this.state

		return (
			<div className="Workspace-App">
				<Sidebar.Pushable as={Segment} className="SideBar">
					<Sidebar
						as={Menu}
						animation='slide along'
						icon='labeled'
						inverted
						onHide={this.handleSidebarHide}
						vertical
						visible={visible}
						width='thin'
						onClick={this.handleButtonClick}
					>
					<Link to="/">
						<Menu.Item as='a'>
							<Icon name='home'/>Todo
            </Menu.Item>
						</Link>
						<Link to="/notebook">
						<Menu.Item as='a'>
							<Icon name='chart pie'/>Notebook
            </Menu.Item>
						</Link>
					</Sidebar>

					<Sidebar.Pusher dimmed={visible}>
						<Segment basic className="Segment">
							<Menu icon>
								<Menu.Item name='align justify' active={true} onClick={this.handleButtonClick}>
									<Icon name='align justify' />
								</Menu.Item>
							</Menu>
							<div id="app" className="App">
								<Header/>
								<p></p>
								{this.props.children}
							</div>
						</Segment>
					</Sidebar.Pusher>
				</Sidebar.Pushable>
			</div>
		)
	}
}

