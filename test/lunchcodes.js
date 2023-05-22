const LunchCodes = artifacts.require("LunchCodes");

contract('LunchCodes', (accounts) => {
  const guard1 = accounts[0]    // initially in the facility
  const guard2 = accounts[1]    // initially in the facility
  const janitor = accounts[2]
  const guard3 = accounts[3]
  const guard4 = accounts[4]
  const attacker = accounts[5]

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

  it('Prevents more than 3 people in the facility', async () => {
    const lc = await LunchCodes.deployed();

    await lc.requestEntry({from: janitor})
    await lc.approve({from: guard1})
    await lc.approve({from: guard2})
    await lc.entry({from: janitor})

    let ep = await lc.getExtraPerson()
    assert.equal(ep, janitor)
    let actualLog = await lc.getLog()
    assert.equal(actualLog.length, 3)
    assert.equal(actualLog[2].person, janitor)
    assert.equal(actualLog[2].out, false)

    try {
      await lc.requestEntry({from: attacker})
      assert.fail(0, 1, 'Transaction not reverted')
    } catch (e) {
      assert.equal(e.message, 'VM Exception while processing transaction: revert')
    }
    await lc.requestExit({from: janitor})
    await lc.approve({from: guard1})
    await lc.approve({from: guard2})
    await lc.exit({from: janitor})
    actualLog = await lc.getLog()
    assert.equal(actualLog.length, 4)
  })

  it('Prevents the guard from leaving the facility while on duty', async () => {
    const lc = await LunchCodes.deployed();

    try {
      await lc.requestExit({from: guard1})
      assert.fail(0, 1, 'Transaction not reverted')
    } catch (e) {
      assert.equal(e.message, 'VM Exception while processing transaction: revert')
    }
  })

  it('Attacker tries to enter without both guards approving', async () => {
    const lc = await LunchCodes.deployed();

    try {
      await lc.entry({from: attacker})
      assert.fail(0, 1, 'Transaction not reverted')
    } catch (e) {
      assert.equal(e.message, 'VM Exception while processing transaction: revert')
    }

    await lc.requestEntry({from: attacker})
    let requestor = await lc.getRequestor()
    assert.equal(requestor, attacker)

    try {
      await lc.entry({from: attacker})
      assert.fail(0, 1, 'Transaction not reverted')
    } catch (e) {
      assert.equal(e.message, 'VM Exception while processing transaction: revert')
    }

    await lc.approve({from: guard1})
    try {
      await lc.entry({from: attacker})
      assert.fail(0, 1, 'Transaction not reverted')
    } catch (e) {
      assert.equal(e.message, 'VM Exception while processing transaction: revert')
    }

    await lc.deny({from: guard2})
    try {
      await lc.entry({from: attacker})
      assert.fail(0, 1, 'Transaction not reverted')
    } catch (e) {
      assert.equal(e.message, 'VM Exception while processing transaction: revert')
    }

    requestor = await lc.getRequestor()
    assert.equal(requestor, 0)
  })

  it('Shiftchange', async () => {
    const lc = await LunchCodes.deployed();
    let state = await lc.getState()
    assert.equal(state, 0) //NONE

    await lc.requestEntry({from: guard3})
    await lc.approve({from: guard1})
    await lc.approve({from: guard2})
    await lc.entry({from: guard3})

    let ep = await lc.getExtraPerson()
    assert.equal(ep, guard3)
    let actualLog = await lc.getLog()
    assert.equal(actualLog.length, 5)
    assert.equal(actualLog[4].person, guard3)
    assert.equal(actualLog[4].out, false)

    await lc.requestGuardChange({from: guard3})
    state = await lc.getState()
    assert.equal(state, 1) //G1_REQUESTED

    await lc.approveGuardChange({from: guard1})
    state = await lc.getState()
    assert.equal(state, 2) //G1_APPROVED

    ep = await lc.getExtraPerson()
    let g1 = await lc.getGuard1()
    assert.equal(ep, guard1)
    assert.equal(g1, guard3)

    await lc.requestExit({from: guard1})
    await lc.approve({from: guard3})
    await lc.approve({from: guard2})
    await lc.exit({from: guard1})

    state = await lc.getState()
    assert.equal(state, 3) //G1_EXITED

    ep = await lc.getExtraPerson()
    assert.equal(ep, 0)
    actualLog = await lc.getLog()
    assert.equal(actualLog.length, 6)
    assert.equal(actualLog[5].person, guard1)
    assert.equal(actualLog[5].out, true)

    await lc.requestEntry({from: guard4})
    await lc.approve({from: guard3})
    await lc.approve({from: guard2})
    await lc.entry({from: guard4})

    state = await lc.getState()
    assert.equal(state, 4) //G2_REQUESTED

    ep = await lc.getExtraPerson()
    assert.equal(ep, guard4)
    actualLog = await lc.getLog()
    assert.equal(actualLog.length, 7)
    assert.equal(actualLog[6].person, guard4)
    assert.equal(actualLog[6].out, false)

    await lc.approveGuardChange({from: guard2})
    state = await lc.getState()
    assert.equal(state, 5) //G2_APPROVED

    ep = await lc.getExtraPerson()
    let g2 = await lc.getGuard2()
    assert.equal(ep, guard2)
    assert.equal(g2, guard4)

    await lc.requestExit({from: guard2})
    await lc.approve({from: guard3})
    await lc.approve({from: guard4})
    await lc.exit({from: guard2})

    state = await lc.getState()
    assert.equal(state, 0) //NONE

    ep = await lc.getExtraPerson()
    assert.equal(ep, 0)
    actualLog = await lc.getLog()
    assert.equal(actualLog.length, 8)
    assert.equal(actualLog[7].person, guard2)
    assert.equal(actualLog[7].out, true)

  })

});
