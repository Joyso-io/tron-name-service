import React from 'react';
import Modal from 'react-bootstrap4-modal';

import './Success.scss';

import success from './success.png';

class Success extends React.Component {
    constructor(props) {
        super(props);
        
        this.closeModal = this.closeModal.bind(this);
    }

    closeModal() {
        this.props.onCloseModal('success');
    }
    render() {
        return (
            <Modal visible={this.props.modalShow} onClickBackdrop={this.closeModal} dialogClassName="modal-dialog-centered">
                <div className="success">
                    <img src={success} alt="success" />
                    <div className="text-contain">
                        <div className="text-title">Transaction Success!</div>
                        <div className="text-content">Please check your address on https://tronscan.org<br/>You use {this.props.price} TRX buy {this.props.input}.trx !!!</div>
                    </div>
                </div>
                <div className="button-contain">
                    <div className="button" onClick={this.closeModal}>Confirm</div>
                </div>
            </Modal>
        )
    }
}

export default Success;