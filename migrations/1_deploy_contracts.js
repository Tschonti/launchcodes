const LunchCodes = artifacts.require("LunchCodes");

module.exports = function(deployer) {
  deployer.deploy(LunchCodes);
};
