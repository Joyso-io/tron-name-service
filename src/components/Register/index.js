import React from 'react';
import Modal from 'react-bootstrap4-modal';
import { ClipLoader } from 'react-spinners';
import moment from 'moment';
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
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.back = this.back.bind(this);
    this.messageBlock = this.messageBlock.bind(this);
    this.targetChange = this.targetChange.bind(this);
    this.setTarget = this.setTarget.bind(this);
    this.sellPriceChange = this.sellPriceChange.bind(this);
    this.sell = this.sell.bind(this);
    this.cancelSell = this.cancelSell.bind(this);
    this.register = this.register.bind(this);
    this.untilDate = this.untilDate.bind(this);

    console.log(moment().unix(), this.props.data.expired);

    this.state = {
      modalShow: false,
      modalShowNoWallet: false,
      successShow: false,
      errorShow: false,
      error: '',
      loading: false,
      target: (props.data.target) ? props.data.target : props.data.address,
      sellPrice: props.data.price,
      expired: (moment().unix() > this.props.data.expired),
      buyValue: 0
    }
  }

  untilDate(value) {
    let until;
    if (!this.props.data.owner) {
      until = moment().add(value, 'day');
    } else {
      until = moment(this.props.data.expired * 1000).add(this.state.buyValue, 'day')
    }
    return until;
  }

  expiredDate() {
    let expired;
    if (!this.props.data.owner) {
      expired = ''
    } else if (this.state.expired) {
      expired = `${moment(this.props.data.expired * 1000).format('YYYY-MM-DD HH:mm:ss a')} (Expired)`;
    } else {
      expired = `${moment(this.props.data.expired * 1000).format('YYYY-MM-DD HH:mm:ss a')}`;
    }
    return expired;
  }

  sellPriceChange(e) {
    this.setState({
      sellPrice: e.target.value
    });
  }

  sell() {
    if (this.state.sellPrice <= 0) {
      return;
    }
    this.props.onSell(this.props.data.input, this.state.sellPrice);
  }

  cancelSell() {
    this.props.onSell(this.props.data.input, 0);
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
  
  openModal(value) {
    if (!this.props.data.address) {
      this.setState({
        modalShowNoWallet: true
      })
      return;
    }
    if (this.state.loading) {
      return;
    }
    this.setState({ modalShow: true, buyValue: value });
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

  async register() {
    if (this.state.loading) {
      return;
    }
    this.setState({
      loading: true
    })
    await Utils.contract.register(this.props.data.input, this.state.target).send({
      callValue: Utils.tronWeb.toSun(this.state.buyValue),
      shouldPollResponse: true
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
    else if (this.state.expired) {
      block = <div className="message">
                <img src={tick} alt="tick" />
                You can take {this.props.data.input}.trx!
              </div>
    } else {
      if (this.props.data.address === this.props.data.owner) {
        block = <div className="message owner">
                <img src={owned} alt="owner" />
                {this.props.data.input}.trx has been owner.
              </div>
      } else {
        block = <div className="message owner">
                  <img src={owner} alt="owner" />
                  You are the {this.props.data.input}.trx owner.
                </div>
      }
    }
    return block;
  }

  render() {
    const message = this.messageBlock();
    const buttonString = (this.props.data.owner === this.props.data.address && !this.state.expired) ? 'Extend': 'Buy';
    const expiredString = this.expiredDate();
  
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
          <div className="col-8 text-right">{expiredString}</div>
        </div>
        <div className={classNames({
          'target-block': true,
          'd-none': this.props.data.price > 0
          })}>
          <div className="text">Target Address:</div>
          <div className="input-group"><input className="form-control target" value={this.state.target} onChange={this.targetChange} /></div>
          <div className={classNames({
          'button': true,
          'change-target': true,
          'd-none': this.props.data.owner !== this.props.data.address || this.state.expired
          })} disabled={!Utils.tronWeb.isAddress(this.state.target)} onClick={this.setTarget}>Change Target</div>
        </div>
        <div className={classNames({
          'buytime-block': true,
          'd-none': this.props.data.price > 0
          })}>
          <div className="buytime-card">
            <div>Expired Date</div>
            <div className="title">1 Day</div>
            <div className="text">Until: <span>{this.untilDate(1).format('YYYY-MM-DD')}</span></div>
            <div className="text">Price: <span>1 TRX</span></div>
            <div className="button buy" onClick={() => this.openModal(1)}>{buttonString}</div>
          </div>
          <div className="buytime-card">
            <div>Expired Date</div>
            <div className="title">1 Year</div>
            <div className="text">Until: <span>{this.untilDate(365).format('YYYY-MM-DD')}</span></div>
            <div className="text">Price: <span>365 TRX</span></div>
            <div className="button buy" onClick={() => this.openModal(365)}>{buttonString}</div>
          </div>
          <div className="buytime-card">
            <div>Expired Date</div>
            <div className="title">1 Month</div>
            <div className="text">Until: <span>{this.untilDate(30).format('YYYY-MM-DD')}</span></div>
            <div className="text">Price: <span>30 TRX</span></div>
            <div className="button buy" onClick={() => this.openModal(30)}>{buttonString}</div>
          </div>
        </div>
        <div className={classNames({
          'sell-block': true,
          'd-none': this.props.data.address !== this.props.data.owner || this.state.expired
          })}>
          <div className="text">Sell Price:</div>
          <div className="input-group">
            <input className="form-control target" type="number" value={this.state.sellPrice} onChange={this.sellPriceChange} />
            <div className="input-group-append">
              <span className="input-group-text" id="basic-addon2">TRX</span>
            </div>
          </div>
          <div className={classNames({
          'button': true,
          'cancel': true,
          'd-none': this.props.data.price <= 0
          })} onClick={this.cancelSell}>Cancel</div>
          <div className="button sell" disabled={this.state.sellPrice <= 0} onClick={this.sell}>Sell</div>
        </div>
        <div className="buttons">
          <div className="button cancel" onClick={this.back}>
            Change name
          </div>
        </div>
        <NoWallet modalShow={this.state.modalShowNoWallet} onCloseModal={this.closeModal} />
        <Modal visible={this.state.modalShow} onClickBackdrop={this.closeModal} dialogClassName="modal-dialog-centered">
          <div className="modal-container">
            <div className="modal-title">You are buying a tron name</div>
            <img src={bid} alt="bid" />
            <div className="row data">
              <div className="col-4">Name</div>
              <div className="col-8">{this.props.data.input}.trx</div>
              <div className="col-4">Owner</div>
              <div className="col-8">{this.props.data.address}</div>
              <div className="col-4">Target</div>
              <div className="col-8">{this.state.target}</div>
              <div className="col-4">Price</div>
              <div className="col-8">{this.state.buyValue} TRX</div>
              <div className="col-4">Expired</div>
              <div className="col-8">{this.untilDate(this.state.buyValue).format('YYYY-MM-DD hh:mm:ss A')}</div>
            </div>
            <div className="buttons">
              <div className="button cancel" disabled={this.state.loading} onClick={this.closeModal}>
                Cancel
              </div>
              <div className="button confirm" disabled={this.state.loading} onClick={this.register}>
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
        <Success input={this.props.data.input} price={this.state.buyValue} modalShow={this.state.successShow} onCloseModal={this.closeModal} />
        <Error error={this.state.error} modalShow={this.state.errorShow} onCloseModal={this.closeModal} />
      </div>
    )
  }
}

export default Register;