import React from 'react';
import Modal from 'react-bootstrap4-modal';

import noWallet from './no-wallet.svg';
import './NoWallet.scss';

class NoWallet extends React.Component {
    constructor(props) {
        super(props);
        
        this.closeModal = this.closeModal.bind(this);
    }

    closeModal() {
        this.props.onCloseModal('no-wallet');
    }

    render() {
        return (
            <Modal visible={this.props.modalShow} onClickBackdrop={this.closeModal} dialogClassName="modal-dialog-centered">
                <div className="no-wallet">
                    <img src={noWallet} alt="no wallet" />
                    <div className="no-wallet-content">
                        <p>If you have not downloaded the wallet, please download the Chrome extensions:</p>
                        <p className="link">TronLink:&nbsp;&nbsp;<a href="https://goo.gl/Yb4NRU" target="_blank" rel="noopener noreferrer">https://goo.gl/Yb4NRU</a></p>
                        <p className="link">TronPay:&nbsp;&nbsp;<a href="https://dwz.cn/FyIuFVay" target="_blank" rel="noopener noreferrer">https://dwz.cn/FyIuFVay</a></p>
                        <p></p>
                        <p>Please switch wallet to mainnet node, don't use testnet node</p>
                        <p></p>
                        <p>After logging in to the wallet or switching accounts, please refresh the page before starting the service.</p>
                    </div>
                    <div className="button" onClick={this.closeModal}>Confirm</div>
                </div>
            </Modal>
            
        )
    }
}

export default NoWallet;