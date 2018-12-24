import React from 'react';
import Modal from 'react-bootstrap4-modal';
import { ClipLoader } from 'react-spinners';
import moment from 'moment';
import _ from 'lodash';
import classNames from 'classnames';

import './Register.scss';
import tick from './tick.png';
import wallet from './wallet.png';
import bid from './bid.png';
import owner from './owner.png';
import owned from './owned.svg';

import Utils from 'utils';
import NoWallet from 'components/NoWallet';
import Success from 'components/Success';
import Error from 'components/Error';


class Register extends React.Component {

  interval;

  constructor(props) {
    super(props);
    this.setAddress = this.setAddress.bind(this);
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.back = this.back.bind(this);
    this.withdraw = this.withdraw.bind(this);
    this.countDown = this.countDown.bind(this);
    this.messageBlock = this.messageBlock.bind(this);
    this.caculateTimestamp = this.caculateTimestamp.bind(this);

    this.interval = setInterval(() => {
      if (this.state.cooldown > 0) {
        this.setState({
          cooldown: this.state.cooldown - 1
        })
      }
    }, 1000);

    let cooldown;
    if (this.props.data.cooldown === 0) {
      cooldown = 0;
    } else {
      const timestamp = moment.unix(this.props.data.cooldown);
      cooldown = Math.floor(timestamp.diff(moment().valueOf()) / 1000);
    }

    this.state = {
      modalShow: false,
      modalShowNoWallet: false,
      successShow: false,
      errorShow: false,
      error: '',
      loading: false,
      cooldown: cooldown
    }
  }
  
  componentWillReceiveProps(props) {
    if (props.data.cooldown !== this.state.color) {
      this.setState({
        cooldown: props.data.cooldown
      })
    }
  }

  caculateTimestamp() {
    let timestamp;
    if (this.props.data.cooldown === 0) {
      timestamp = moment();
    } else {
      timestamp = moment.unix(this.props.data.cooldown);
    }
    return timestamp.toString()
  }

  countDown() {
    let cooldown;
    const timestamp = moment.unix(this.props.data.cooldown);
    cooldown = Math.floor(timestamp.diff(moment().valueOf()) / 1000);
    if (cooldown < 0) {
      cooldown = 0;
    }
    const hours = _.padStart(Math.floor(cooldown % (60 * 60 * 24) / (60 * 60), 2, '0'));
    const minutes = _.padStart(Math.floor(cooldown % (60 * 60 ) / 60), 2, '0');
    const seconds = _.padStart(Math.floor(cooldown % 60 ), 2, '0');
    return `${hours} hours ${minutes} minutes ${seconds} seconds`;
  }

  back() {
    this.props.onBack();
  }
  
  openModal() {
    if (!this.props.data.address) {
      this.setState({
        modalShowNoWallet: true
      })
      return;
    }
    if (this.state.loading || this.props.data.address === this.props.data.owner || this.state.cooldown > 0) {
      return;
    }
    this.setState({ modalShow: true });
  }

  closeModal(e) {
    if (this.state.loading) {
      return;
    }

    switch (e) {
      case 'no-wallet':
        this.setState({
          modalShowNoWallet: false
        });
        break;
      case 'success':
        this.setState({
          successShow: false
        });
        break;
      case 'error':
        this.setState({
          errorShow: false
        });
        break;
      default:
        this.setState({ modalShow: false });
    }
  }

  withdraw() {
    this.props.onWithdraw();
  }

  checkAddress() {
    this.props.onCheckAddress();
  }

  async setAddress(bidPrice) {
    if (this.state.loading) {
      return;
    }
    this.setState({
      loading: true
    })
    await Utils.contract.setAddress(this.props.data.input).send({
      callValue: Utils.tronWeb.toSun(bidPrice)
    }).then((res) => {
      this.checkAddress();
      this.setState({
        loading: false,
        modalShow: false,
        successShow: true
      })
      console.log(res);
    }).catch((err) => {
      console.log(err);
      this.setState({
        loading: false,
        errorShow: true,
        error: err
      })
    });
  }

  messageBlock() {
    let block;
    if (this.props.data.address && this.props.data.owner === this.props.data.address) {
      block = <div className="message owner">
                  <img src={owner} alt="owner" />
                  You are the {this.props.data.input}.trx owner.
                </div>
    } else {
      if (this.props.data.addressUsed) {
        block = <div className="message">
                    <img src={owned} alt="owned" />
                    {this.props.data.input}.trx is already owned.
                  </div>
      } else {
        block = <div className="message">
                    <img src={tick} alt="tick" />
                    You can take {this.props.data.input}.trx!
                  </div>
      }
    }
    return block;
  }

  walletBlock() {
    let block;
    if (this.props.data.address && this.props.data.owner === this.props.data.address) {
      block = <div></div>
    } else if (this.props.data.address) {
      block = <div className="wallet">
                <img src={wallet} alt="wallet" />
                <div className="text">
                  <div className="row">
                    <div className="col-4">
                      Account Address:
                    </div>
                    <div className="col-8">
                      {this.props.data.address}
                    </div>
                    <div className="col-4">
                      Account Balance:
                    </div>
                    <div className="col-8">
                      {this.props.data.balance} TRX
                    </div>
                    <div className="col-4">
                      Pending Withdraw:
                    </div>
                    <div className="col-8">
                      {this.props.data.pendingWithdraw} TRX
                      <i className="fas fa-share" title="withdraw" onClick={this.withdraw}></i>
                    </div>
                  </div>
                </div>
              </div>
    } else {
      block = <div></div>
    }
    return block;
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    
    const message = this.messageBlock();
    const wallet = this.walletBlock();
    const bidPrice = this.props.data.owner ? (this.props.data.price * 1.3).toFixed(6) : this.props.data.price;
  
    return (
      <div className="register">
        {message}
        {wallet}
        <div className="cooldown">
          <div className="title"><i className="far fa-clock"></i>You Can Buy It Until</div>
          <div className="fix-time">{this.caculateTimestamp()}</div>
          <div className="down-time">{this.countDown()}</div>
        </div>
        <div className="form row">
          <div className="col-4">Name: </div>
          <div className="col-8 text-right">{this.props.data.input}.trx</div>
          <div className="col-4">Owner: </div>
          <div className="col-8 text-right">{this.props.data.owner}</div>
          <div className="col-4">Current Price: </div>
          <div className="col-8 text-right">{this.props.data.price} TRX</div>
          <div className="col-4">Bid Price: </div>
          <div className="col-8 text-right">{bidPrice} TRX</div>
        </div>
        <div className="buttons">
          <div className="button cancel" onClick={this.back}>
            Change a name
          </div>
          <div className={classNames({
                button: true,
                confirm: true,
                'd-none': this.props.data.address && this.props.data.owner === this.props.data.address
                })} disabled={this.state.cooldown > 0} onClick={this.openModal}>
            Buy It!
          </div>
        </div>
        <NoWallet modalShow={this.state.modalShowNoWallet} onCloseModal={this.closeModal} />
        <Modal visible={this.state.modalShow} onClickBackdrop={this.closeModal} dialogClassName="modal-dialog-centered">
          <div className="modal-container">
            <div className="modal-title">You are about to start a bid</div>
            <img src={bid} alt="bid" />
            <div className="row data">
              <div className="col-4">Name</div>
              <div className="col-8">{this.props.data.input}.trx</div>
              <div className="col-4">Price</div>
              <div className="col-8">{bidPrice} TRX</div>
              <div className="col-4">Address</div>
              <div className="col-8">{this.props.data.address}</div>
            </div>
            <div className="buttons">
              <div className="button cancel" disabled={this.state.loading} onClick={this.closeModal}>
                Cancel
              </div>
              <div className="button confirm" disabled={this.state.loading} onClick={() => {this.setAddress(bidPrice)}}>
                Confirm
              </div>
            </div>
            <ClipLoader
              className={`position: absolute`}
              sizeUnit={"px"}
              size={50}
              color={'#123abc'}
              loading={this.state.loading}
            />
          </div>
        </Modal>
        <Success input={this.props.data.input} price={this.props.data.price} modalShow={this.state.successShow} onCloseModal={this.closeModal} />
        <Error error={this.state.error} modalShow={this.state.errorShow} onCloseModal={this.closeModal} />
      </div>
    )
  }
}

export default Register;