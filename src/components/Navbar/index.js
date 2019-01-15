import React from 'react';
import {
    Collapse,
    Navbar,
    NavbarBrand,
    Nav,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu } from 'reactstrap';

import TNSLogo from './logo.png';
import './Navbar.scss';

class Navbard extends React.Component {
    constructor(props) {
        super(props);

        this.messageBoard = this.messageBoard.bind(this);
    }

    messageBoard() {
        if (this.props.address && this.props.address.base58) {
            return (
                <div className="message board">
                    <div className="message-content">
                        <p><i className="fas fa-wallet mr-2"></i>Address: {this.props.address.base58}</p>
                        <p className="mb-0"><img className="mr-2 mb-1" src="https://s2.coinmarketcap.com/static/img/coins/32x32/1958.png" alt="TRON" width="16" />TRX Balance: {this.props.balance} TRX</p>
                    </div>
                </div>
            )
        } else {
            return (
                <div className="message board">
                    <h4 className="message-title text-center">Please log in TRON Chrome Wallet.</h4>
                    <div className="message-content">
                        <p>If you have not downloaded the wallet, please download the Chrome extensions:</p>
                        <p>TronLink: <a href="https://goo.gl/Yb4NRU" target="_blank" rel="noopener noreferrer">https://goo.gl/Yb4NRU</a></p>
                        <p>TronPay: <a href="https://dwz.cn/FyIuFVay" target="_blank" rel="noopener noreferrer">https://dwz.cn/FyIuFVay</a></p>
                        <p></p>
                        <p>Please switch wallet to mainnet node, don't use testnet node</p>
                        <p></p>
                        <p>After logging in to the wallet or switching accounts, please refresh the page before starting the service.</p>
                    </div>
                </div>
            )
        }
    }
    
    render() {
        const address = (this.props.address && this.props.address.base58) ? `${this.props.address.base58.substr(0, 5)}.....${this.props.address.base58.substr(-5)}` : 'Log In';
        const message = this.messageBoard();
        return (
            <div>
                <Navbar expand="md">
                    <NavbarBrand href="/">
                        <img src={ TNSLogo } height="36" alt="TNS Logo" />
                    </NavbarBrand>
                    <Collapse navbar>
                        <Nav className="ml-auto" navbar>
                            <UncontrolledDropdown nav inNavbar className="mr-3">
                                <DropdownToggle nav caret>
                                    Introduction
                                </DropdownToggle>
                                <DropdownMenu right>
                                    <div className="rule">
                                        <p>1. Check the name is owned or not.</p>
                                        <p>2. If not, you can buy it with default price.(approximately 1 Day 1 TRX)</p>
                                        <p>3. If owned, only owner can choose to sell it or wait it been expired.</p>
                                        <p>4. If you are owner, you can extend expire time or sell the domain name.</p>
                                        <p>5. Every domain name sell will charge 1% fee.</p>
                                    </div>
                                </DropdownMenu>
                            </UncontrolledDropdown>
                            <UncontrolledDropdown nav inNavbar>
                                <DropdownToggle nav caret>
                                    {address}
                                </DropdownToggle>
                                <DropdownMenu right>
                                    {message}
                                </DropdownMenu>
                            </UncontrolledDropdown>
                        </Nav>
                    </Collapse>
                </Navbar>
            </div>
        );
    }
}

export default Navbard;