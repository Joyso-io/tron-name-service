import React from 'react';
import Modal from 'react-bootstrap4-modal';
import { ClipLoader } from 'react-spinners';
import moment from 'moment';
import _ from 'lodash';
import classNames from 'classnames';

import './Register.scss';
import tick from './tick.png';
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
    this.messageBlock = this.messageBlock.bind(this);
    this.targetChange = this.targetChange.bind(this);
    this.setTarget = this.setTarget.bind(this);
    this.sellPriceChange = this.sellPriceChange.bind(this);
    this.sell = this.sell.bind(this);

    this.state = {
      modalShow: false,
      modalShowNoWallet: false,
      successShow: false,
      errorShow: false,
      error: '',
      loading: false,
      target: props.data.target,
      sellPrice: props.data.price,
      onsale: (this.props.data.price > 0)
    }
  }

  sellPriceChange(e) {
    this.setState({
      sellPrice: e.target.value
    });
  }

  sell() {
    this.props.onSell(this.props.data.input, this.state.sellPrice);
  }

  targetChange(e) {
    this.setState({
      target: e.target.value
    });
  }

  setTarget() {
    if (!Utils.tronWeb.isAddress(this.state.target)) {
      return;
    }
    this.props.onChangeTarget(this.props.data.input, this.state.target);
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
    if (this.props.data.price > 0) {
      block = <div className="message owner">
                <img src={owner} alt="owner" />
                {this.props.data.input}.trx is on sale.
              </div>
    }
    else if (this.props.data.address && this.props.data.owner === this.props.data.address) {
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

  render() {
    const message = this.messageBlock();
    const bidPrice = this.props.data.owner ? (this.props.data.price * 1.3).toFixed(6) : this.props.data.price;
  
    return (
      <div className="register">
        {message}
        <div className="form row">
          <div className="col-4">Name: </div>
          <div className="col-8 text-right">{this.props.data.input}.trx</div>
          <div className="col-4">Owner: </div>
          <div className="col-8 text-right">{this.props.data.owner}</div>
          <div className="col-4">Target: </div>
          <div className="col-8 text-right">{this.props.data.target}</div>
          <div className="col-4">Expired: </div>
          <div className="col-8 text-right">{moment(this.props.data.expired * 1000).format('YYYY-MM-DD HH:mm:ss a')}</div>
        </div>
        <div className={classNames({
          'target-block': true,
          'd-none': this.state.onsale
          })}>
          <div className="text">Target Address:</div>
          <div className="input-group"><input className="form-control target" value={this.state.target} onChange={this.targetChange} /></div>
          <div className="button change-target" disabled={!Utils.tronWeb.isAddress(this.state.target)} onClick={this.setTarget}>Change Target</div>
        </div>
        <div className={classNames({
          'buytime-block': true,
          'd-none': this.state.onsale
          })}>
          <div className="buytime-card">
            <div>Expired Date</div>
            <div className="title">1 Day</div>
            <div className="text">Until: </div>
            <div className="text">Price: <span>1 TRX</span></div>
            <div className="button buy">Buy</div>
          </div>
          <div className="buytime-card">
            <div>Expired Date</div>
            <div className="title">1 Month</div>
            <div className="text">Until: </div>
            <div className="text">Price: <span>30 TRX</span></div>
            <div className="button buy">Buy</div>
          </div>
          <div className="buytime-card">
            <div>Expired Date</div>
            <div className="title">1 Year</div>
            <div className="text">Until: </div>
            <div className="text">Price: <span>360 TRX</span></div>
            <div className="button buy">Buy</div>
          </div>
        </div>
        <div className="sell-block">
          <div className="text">Sell Price:</div>
          <div className="input-group">
            <input className="form-control target" type="number" value={this.state.sellPrice} onChange={this.sellPriceChange} />
            <div className="input-group-append">
              <span className="input-group-text" id="basic-addon2">TRX</span>
            </div>
          </div>
          <div className="button sell" disabled={this.state.sellPrice <= 0} onClick={this.sell}>Sell</div>
        </div>
        <div className="buttons">
          <div className="button cancel" onClick={this.back}>
            Change name
          </div>
          {/* <div className={classNames({
                button: true,
                confirm: true,
                'd-none': this.props.data.address && this.props.data.owner === this.props.data.address
                })} disabled={this.state.cooldown > 0} onClick={this.openModal}>
            Buy It!
          </div> */}
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