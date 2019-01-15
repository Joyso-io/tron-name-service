var TronNameService = artifacts.require("./TronNameService.sol");

module.exports = function(deployer) {
  deployer.deploy(TronNameService)
    .then(() => TronNameService.deployed())
    .then(tns => {
      if (process.env.ADMIN) {
        tns.addToAdmin(process.env.ADMIN, true);
      }
    });
};
