let contractAddress;
// if (process.env.NODE_ENV === 'production') {
    contractAddress = 'TTQg1UwfKZpNRm4v8C2zBNf5715d5KSn5G';
// } else {
//     contractAddress = 'TTRApcnfKNJ5Vn4sEpXCPsUAyLBUYQt81X';
// }

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

    async register(name, target, value) {
        return this.contract.register(name, target).send({
            callValue: value
        });
    },

    async setTarget(name, target) {
        return this.contract.setTarget(name, target).send();
    },

    async sell(name, price) {
        return this.contract.sell(name, price).send();
    },

    async buy(name, price) {
        return this.contract.buy(name).send({
            callValue: price,
            shouldshouldPollResponse: true
        })
    },

    async withdraw() {
        return this.contract.withdraw().send();
    },

    async isOpen() {
        return this.contract.open().call();
    }
};

export default utils;
