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
        this.withdrawBoard = this.withdrawBoard.bind(this);
        this.withdraw = this.withdraw.bind(this);
    }

    withdraw() {
        this.props.onWithdraw();
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

    withdrawBoard() {
        if (this.props.address && this.props.address.base58) {
            return (
                <div className="withdraw board">
                    <div className="withdraw-header">
                        <p className="mb-0"><img className="mr-3 mb-1" src="https://s2.coinmarketcap.com/static/img/coins/32x32/1958.png" alt="TRON" width="24" />{this.props.pendingWithdraw} TRX</p>
                        <div className="button withdraw-button" onClick={this.withdraw}>Withdraw</div>
                    </div>
                    <div className="withdraw-content">
                        The pending withdrawal is withdrawn to the player's address, and the user can check the arrival of TRX on tronscan.org and/or all TRON wallets.
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
        const withdraw = this.withdrawBoard();
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
                                    Withdrawal
                                </DropdownToggle>
                                <DropdownMenu right>
                                    <div>
                                        {withdraw}
                                    </div>
                                </DropdownMenu>
                            </UncontrolledDropdown>
                            <UncontrolledDropdown nav inNavbar className="mr-3">
                                <DropdownToggle nav caret>
                                    Introduction
                                </DropdownToggle>
                                <DropdownMenu right>
                                    <div className="rule">
                                        <p>1. Check the name is owned or not.</p>
                                        <p>2. If not, you can buy it with default price.</p>
                                        <p>3. If owned, and not in cooldown time, you can buy it with 1.3x price.</p>
                                        <p className="mb-0">4. If your name has been bought, the 1.3x price TRX will go into withdrawal, you can withdraw it.</p>
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