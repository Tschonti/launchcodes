const LunchCodes = artifacts.require("LunchCodes");

contract('LunchCodes', (accounts) => {
  let guard1 = accounts[0]
  let guard2 = accounts[1]
  it('should put 10000 MetaCoin in the first account', async () => {
    const lc = await LunchCodes.deployed();

    await lc.requestEntry.call(accounts[2])
    await lc.approve.call(guard1)
    await lc.approve.call(guard2)
    await lc.entry.call(accounts[2])

    const ep = await lc.getExtraPerson.call(accounts[2])
    assert.equal(ep, accounts[2])
    const log = await lc.getLog.cal(accounts[2])
    console.log(log)
  });
});
