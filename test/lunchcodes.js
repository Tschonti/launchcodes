const LunchCodes = artifacts.require("LunchCodes");

contract('LunchCodes', (accounts) => {
  let guard1 = accounts[0]
  let guard2 = accounts[1]
  it('Janitor enters the building then leaves', async () => {
    const lc = await LunchCodes.deployed();

    await lc.requestEntry({from: accounts[2]})
    await lc.approve({from: guard1})
    await lc.approve({from: guard2})
    await lc.entry({from: accounts[2]})

    let ep = await lc.getExtraPerson()
    assert.equal(ep, accounts[2])
    let actualLog = await lc.getLog()
    assert.equal(actualLog.length, 1)
    assert.equal(actualLog[0].person, accounts[2])
    assert.equal(actualLog[0].out, false)

    await lc.requestExit({from: accounts[2]})
    await lc.approve({from: guard1})
    await lc.approve({from: guard2})
    await lc.exit({from: accounts[2]})

    ep = await lc.getExtraPerson()
    assert.equal(ep, 0)
    actualLog = await lc.getLog()
    assert.equal(actualLog.length, 2)
    assert.equal(actualLog[1].person, accounts[2])
    assert.equal(actualLog[1].out, true)

  });
});
