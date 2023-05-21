const LunchCodes = artifacts.require("LunchCodes");

contract('LunchCodes', (accounts) => {
  const guard1 = accounts[0]    // initially in the facility
  const guard2 = accounts[1]    // initially in the facility
  const janitor = accounts[2]
  const guard3 = accounts[3]
  const guard4 = accounts[4]

  it('Janitor enters the building then leaves', async () => {
    const lc = await LunchCodes.deployed();

    await lc.requestEntry({from: janitor})
    await lc.approve({from: guard1})
    await lc.approve({from: guard2})
    await lc.entry({from: janitor})

    let ep = await lc.getExtraPerson()
    assert.equal(ep, janitor)
    let actualLog = await lc.getLog()
    assert.equal(actualLog.length, 1)
    assert.equal(actualLog[0].person, janitor)
    assert.equal(actualLog[0].out, false)

    await lc.requestExit({from: janitor})
    await lc.approve({from: guard1})
    await lc.approve({from: guard2})
    await lc.exit({from: janitor})

    ep = await lc.getExtraPerson()
    assert.equal(ep, 0)
    actualLog = await lc.getLog()
    assert.equal(actualLog.length, 2)
    assert.equal(actualLog[1].person, janitor)
    assert.equal(actualLog[1].out, true)

  });

  it('Shiftchange', async () => {

  })

  it('Prevents more than 3 people in the facility', async () => {

  })

  it('Prevents the guard from leaving the facility while on duty', async () => {

  })

  it('Someone tries to enter, the guards deny it. Janitor can still enter afterwards', async () => {

  })
});
