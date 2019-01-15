var TronNameService = artifacts.require("./TronNameService.sol");

module.exports = function(deployer) {
  deployer.deploy(TronNameService)
    .then(() => TronNameService.deployed())
    .then(tns => {
      tns.addToAdmin(process.env.ADMIN, true);
    });
};
