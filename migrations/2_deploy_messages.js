var TronNameService = artifacts.require("./TronNameService.sol");

module.exports = function(deployer) {
  deployer.deploy(TronNameService);
};
