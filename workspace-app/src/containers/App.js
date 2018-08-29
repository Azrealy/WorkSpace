// @flow
import * as React from 'react'
import Header from '../components/Header'
import './App.css'
import{ Link } from "react-router";
import { Button, Icon, Image, Menu, Segment, Sidebar } from 'semantic-ui-react'

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
						animation='overlay'
						icon='labeled'
						inverted
						onHide={this.handleSidebarHide}
						vertical
						visible={visible}
						width='thin'
						onClick={this.handleButtonClick}
					>
						<Menu.Item as='a'>
							<Link to="/"><Icon name='home'/>Todo</Link>
            </Menu.Item>
						<Menu.Item as='a'>
							<Link to="/jupyter"><Icon name='chart pie'/>Notebook</Link>
            </Menu.Item>
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

