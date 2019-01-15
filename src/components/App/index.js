import React from 'react';
import TronWeb from 'tronweb';
import Utils from 'utils';
import Navbar from 'components/Navbar';
import Register from 'components/Register';

import './App.scss';
import banner from 'assets/banner.gif';

const FOUNDATION_ADDRESS = 'TWiWt5SEDzaEqS6kE5gandWMNfxR2B5xzg';

class App extends React.Component {
  watcher = null;

  state = {
    tronWeb: {
      installed: false,
      loggedIn: false
    },
    account: '',
    input: '',
    checked: false,
    addressUsed: false,
    owner: '',
    balance: 0,
    price: 1
  }

  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.checkAddress = this.checkAddress.bind(this);
    this.setTarget = this.setTarget.bind(this);
    this.backToMain = this.backToMain.bind(this);
    this.withdraw = this.withdraw.bind(this);
    this.sell = this.sell.bind(this);
    this.buy = this.buy.bind(this);
  }

  async componentDidMount() {
    let TRONGRID_API;
    // if (process.env.NODE_ENV === 'production') {
      TRONGRID_API = 'https://api.trongrid.io/';
    // } else {
    //   TRONGRID_API = 'https://api.shasta.trongrid.io/';
    // }
    window.tronWebFondation = new TronWeb(
      TRONGRID_API,
      TRONGRID_API,
      TRONGRID_API
    );
    
    window.tronWebFondation.defaultAddress = {
      hex: window.tronWebFondation.address.toHex(FOUNDATION_ADDRESS),
      base58: FOUNDATION_ADDRESS
    };
    await Utils.setTronWebFondation(window.tronWebFondation);

    await new Promise(resolve => {
      const interval =setInterval(() => {
        if (!!window.tronWeb) {
          clearInterval(interval);
          return resolve();
        }
      }, 1000);
    });
    
    if (this.state.account !== window.tronWeb.defaultAddress) {
      this.setState({ account: window.tronWeb.defaultAddress });
      await Utils.setTronWeb(window.tronWeb);
      this.startEventListener();
    }

    window.tronWeb.on('addressChanged', async() => {
      if (this.state.account !== window.tronWeb.defaultAddress) {
        this.setState({ account: window.tronWeb.defaultAddress });
        await Utils.setTronWeb(window.tronWeb);
        this.startEventListener();
      }
    })
  }

  // Polls blockchain for smart contract events
  startEventListener() {
  // Utils.contract.MessagePosted().watch((err, { result }) => {
  //     if(err)
  //         return console.error('Failed to bind event listener:', err);

  //     console.log('Detected new message:', result.id);
  //     this.fetchMessage(+result.id);
  // });
    clearInterval(this.watcher);
    this.watcher = setInterval(async() => {
      if (Utils.tronWeb) {
        const balance = Utils.tronWeb.fromSun(await Utils.tronWeb.trx.getBalance());
        if (this.state.balance !== balance) {
          this.setState({
            balance: balance
          })
        }
      }
    }, 1000);
  }

  handleChange(e) {
    this.setState({input: e.target.value});
  }

  async withdraw() {
    if (this.state.pendingWithdraw === '0') {
      return;
    }
    await Utils.withdraw();
  }

  async sell(name, price) {
    await Utils.sell(name, Utils.tronWebFondation.toSun(price));
    await this.checkAddress();
  }

  async buy(name, price) {
    await Utils.buy(name, Utils.tronWebFondation.toSun(price));
    await this.checkAddress();
  }

  async setTarget(name, target) {
    await Utils.setTarget(name, target);
    await this.checkAddress();
  }

  async checkAddress() {
    if (!this.state.input) {
      return
    }
    const input = this.state.input.toLowerCase();
    const result = await Utils.getRecord(input);
    const isOpen = await Utils.isOpen()
    let addressUsed, owner, target, expired, price;
    if (result[1] === "410000000000000000000000000000000000000000") {
      addressUsed = false;
      owner = '';
      target = '';
    } else {
      addressUsed = true;
      owner = Utils.tronWebFondation.address.fromHex(result[1]);
      target = Utils.tronWebFondation.address.fromHex(result[2]);
    }
    expired = parseInt(result[3]);
    price = Utils.tronWebFondation.fromSun(result[4]);
    this.setState({
      addressUsed: addressUsed,
      checked: true,
      owner: owner,
      target: target,
      expired: expired,
      price: price,
      input: input,
      isOpen: isOpen
    })
  }

  backToMain() {
    this.setState({
      input: '',
      owner: '',
      addressUsed: false,
      checked: false
    });
  }

  render() {
    let page;
    if (!this.state.checked) { 
      page =  <div className="main">
                <div className="banner">
                  <img src={banner} alt="banner" />
                </div>
                <div className="intro">
                  The <a href="./">Tron Name Service</a> is a distributed, open, and extensible naming system based on the Tron blockchain. Once you have a name, you can tell your friends to send TRX to <span className="name">justin.trx&nbsp;&nbsp;</span> instead of <span className="address">TWiWt5SEDzaEqS6kE5gandWMNfxR2B5xzg......</span>
                </div>
                <div className="search">
                  <div className="input-group">
                    <input type="text" className="form-control" placeholder="justin" onChange={this.handleChange} />
                    <div className="input-group-append">
                      <span className="input-group-text">.trx</span>
                    </div>
                  </div>
                </div>
                <div className="button check" onClick={this.checkAddress}>
                  Check TNS Name
                </div>
              </div>
    } else {     
      page = <Register data={{
                input: this.state.input, 
                owner: this.state.owner,
                address: this.state.account.base58,
                balance: this.state.balance,
                target: this.state.target,
                expired: this.state.expired,
                price: this.state.price,
                addressUsed: this.state.addressUsed,
                loading: this.state.loading,
                isOpen: this.state.isOpen
              }} onCheckAddress={this.checkAddress} onBack={this.backToMain} onChangeTarget={this.setTarget} onSell={this.sell} onBuy={this.buy} />
    }

    return (
      <div>
        <Navbar address={this.state.account} balance={this.state.balance} />
        <div className="container">
          {page}
        </div>
      </div>          
    )
  }
}

export default App;
