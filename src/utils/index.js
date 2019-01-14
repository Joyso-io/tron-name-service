const contractAddress = 'TMf2gzpxpnePxv5ZKyxPQu2r2vkuVrk2kT';

const utils = {
    tronWeb: false,
    contract: false,
    tronWebFondation: false,
    contractFoundation: false,

    async setTronWeb(tronWeb) {
        this.tronWeb = tronWeb;
        this.contract = await tronWeb.contract().at(contractAddress)
    },

    async setTronWebFondation(tronWebFondation) {
        this.tronWebFondation = tronWebFondation;
        this.contractFoundation = await tronWebFondation.contract().at(contractAddress);
    },

    async getRecord(name) {
        return this.contractFoundation.getRecord(name).call();
    },

    async setAddress(name) {
        return this.contract.setAddress(name).send();
    },

    async checkPendingWithdraw() {
        return this.contract.checkPendingWithdraw().call();
    },

    async withdraw() {
        return this.contract.withdraw().send();
    }
};

export default utils;
