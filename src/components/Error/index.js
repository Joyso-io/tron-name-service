import React from 'react';
import Modal from 'react-bootstrap4-modal';

import './Error.scss';

class Error extends React.Component {
    constructor(props) {
        super(props);
        
        this.closeModal = this.closeModal.bind(this);
    }

    closeModal() {
        this.props.onCloseModal('error');
    }
    render() {
        return (
            <Modal visible={this.props.modalShow} onClickBackdrop={this.closeModal} dialogClassName="modal-dialog-centered">
                <div className="error">
                    <div className="text-contain">
                        <div className="text-title">Transaction Error!</div>
                        <div className="text-content">Oops!!! There are some problem. Error: {this.props.error}</div>
                    </div>
                </div>
                <div className="button-contain">
                    <div className="button" onClick={this.closeModal}>Confirm</div>
                </div>
            </Modal>
        )
    }
}

export default Error;