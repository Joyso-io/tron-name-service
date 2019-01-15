const contractAddress = 'TRSpDuS5sQrqmUGsobpcZx4SJP8uw7CD19';

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

    async setTarget(name, target) {
        return this.contract.setTarget(name, target).send();
    },

    async sell(name, price) {
        return this.contract.sell(name, price).send();
    },

    async withdraw() {
        return this.contract.withdraw().send();
    }
};

export default utils;
