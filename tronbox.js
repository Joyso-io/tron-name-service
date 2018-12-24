module.exports = {
  networks: {
    development: {
// For trontools/quickstart docker image
      privateKey: '',
      userFeePercentage: 30,
      feeLimit: 1e8,
      fullHost: "http://127.0.0.1:9090",
      originalEnergyLimit: 1e5,
      callValue: 0,
      network_id: "*"
    },
    shasta: {
      privateKey: '',
      userFeePercentage: 30,
      feeLimit: 1e8,
      fullHost: "hhttps://api.shasta.trongrid.io",
      fullNode: "https://api.shasta.trongrid.io",
      solidityNode: "https://api.shasta.trongrid.io",
      eventServer: "https://api.shasta.trongrid.io",
      originalEnergyLimit: 1e5,
      callValue: 0,
      network_id: "*"
    },
    mainnet: {
// Don't put your private key here, pass it using an env variable, like:
// PK=da146374a75310b9666e834ee4ad0866d6f4035967bfc76217c5a495fff9f0d0 tronbox migrate --network mainnet
      privateKey: '',
      consume_user_resource_percent: 30,
      fee_limit: 100000000,
      fullNode: "https://api.trongrid.io",
      solidityNode: "https://api.trongrid.io",
      eventServer: "https://api.trongrid.io",
      network_id: "*"
    }
  }
};
