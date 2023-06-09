const LunchCodes = artifacts.require("LunchCodes");

module.exports = function(deployer) {
  deployer.deploy(LunchCodes, "0x2191eF87E392377ec08E7c08Eb105Ef5448eCED5", "0x627306090abaB3A6e1400e9345bC60c78a8BEf57", "0xf17f52151EbEF6C7334FAD080c5704D77216b732");
};
