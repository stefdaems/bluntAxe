import React, { Component } from 'react';
import './App.css';
import { Menu, Icon, Button } from 'antd';
import 'antd/dist/antd.css';
import ResultsPane from '../src/components/resultsPane.js';

class App extends Component {
    constructor(props) {
        super(props);
        this.showView = this.showView.bind(this);
        this.state = {
            collapsed: false,
            id: null,
            result: null
        }
    }

    showView(item) {
        if ( item && item.key !== this.state.id ) {
            console.log(item.key);
            this.setState({
                id: item.key,
                result: <ResultsPane target={item.key} />
            });
        }
    }

    toggleCollapsed = () => {
        this.setState({
            collapsed: !this.state.collapsed,
        });
    }

    render() {
        const MyMenu = () => (
            <div style={{ width:  256}}>
                <Button type="primary" onClick={this.toggleCollapsed} style={{ marginBottom: 16 }}>
                    <Icon type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'} />
                </Button>
                <Menu
                    mode="inline"
                    theme="dark"
                    inlineCollapsed={this.state.collapsed}
                    onClick={ (item, key) => this.showView(item, key)}
                >
                    <Menu.Item key="errorCodes">
                        <Icon type="pie-chart" />
                        <span>errorCodes</span>
                    </Menu.Item>
                    <Menu.Item key="cpeHistory">
                        <Icon type="desktop" />
                        <span>cpeHistory</span>
                    </Menu.Item>
                    <Menu.Item key="Playerstats">
                        <Icon type="desktop" />
                        <span>playout</span>
                    </Menu.Item>
                </Menu>
            </div>
        );

        return (
            <div className="App">
                <div className="one">
                    <MyMenu />
                </div>
                <div className="two">
                    {this.state.result}
                </div>
            </div>
        )
    }
}

export default App;
