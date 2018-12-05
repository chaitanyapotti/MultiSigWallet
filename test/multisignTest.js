const truffleAssert = require("truffle-assertions");
const MultiSigWallet = artifacts.require("./CustomMultiSigWallet.sol");
const web3 = MultiSigWallet.web3;
const deployMultisig = (owners, confirmations) => {
  return MultiSigWallet.new(owners, confirmations);
};

contract("MultiSingWallet", function(accounts) {
  let multisigInstance;
  const requiredConfirmations = 2;
  beforeEach(async () => {
    multisigInstance = await deployMultisig([accounts[0], accounts[1], accounts[2]], requiredConfirmations);
    assert.ok(multisigInstance);
  });
  it("sends money to wallet", async () => {
    const deposit = 10;
    await web3.eth.sendTransaction({ to: multisigInstance.address, value: deposit, from: accounts[0] });
    const balance = await web3.eth.getBalance(multisigInstance.address);
    assert.equal(balance, deposit);
  });
  it("add owner& remove owner", async () => {
    const deposit = 10;
    await web3.eth.sendTransaction({ to: multisigInstance.address, value: deposit, from: accounts[0] });
    const result = await multisigInstance.submitTransaction(
      multisigInstance.address,
      0,
      "0x7065cb48" + "000000000000000000000000" + accounts[3].substring(2),
      { from: accounts[0] }
    );
    truffleAssert.eventEmitted(result, "Submission");
    truffleAssert.eventEmitted(result, "Execution");
    const ownerResult = await multisigInstance.isOwner(accounts[3]);
    assert.equal(ownerResult, true);
    await multisigInstance.submitTransaction(multisigInstance.address, 0, "0x173825d9" + "000000000000000000000000" + accounts[3].substring(2), {
      from: accounts[0]
    });
    const removeResult = await multisigInstance.isOwner(accounts[3]);
    assert.equal(removeResult, false);
  });
  it("withdraw ether", async () => {
    const deposit = "10";
    await web3.eth.sendTransaction({ to: multisigInstance.address, value: web3.utils.toWei(deposit, "ether"), from: accounts[0] });
    const result = await multisigInstance.submitTransaction(
      accounts[4],
      web3.utils.toWei("2", "ether"),
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      { from: accounts[0] }
    );
    truffleAssert.eventEmitted(result, "Submission");
    truffleAssert.eventEmitted(result, "Execution");
    const balance = parseFloat(await web3.utils.fromWei(await web3.eth.getBalance(accounts[4])));
    assert.isAtLeast(balance, 10002);
  });
  it("add owner& replace owner", async () => {
    const deposit = 10;
    await web3.eth.sendTransaction({ to: multisigInstance.address, value: deposit, from: accounts[0] });
    const result = await multisigInstance.submitTransaction(
      multisigInstance.address,
      0,
      "0x7065cb48" + "000000000000000000000000" + accounts[3].substring(2),
      { from: accounts[0] }
    );
    truffleAssert.eventEmitted(result, "Submission");
    truffleAssert.eventEmitted(result, "Execution");
    const ownerResult = await multisigInstance.isOwner(accounts[3]);
    assert.equal(ownerResult, true);
    await multisigInstance.submitTransaction(
      multisigInstance.address,
      0,
      "0xe20056e6" + "000000000000000000000000" + accounts[3].substring(2) + "000000000000000000000000" + accounts[4].substring(2),
      {
        from: accounts[0]
      }
    );
    const removeResult = await multisigInstance.isOwner(accounts[3]);
    assert.equal(removeResult, false);
    const replaceResult = await multisigInstance.isOwner(accounts[4]);
    assert.equal(replaceResult, true);
  });
  it("withdraw ether multi", async () => {
    const deposit = "10";
    await web3.eth.sendTransaction({ to: multisigInstance.address, value: web3.utils.toWei(deposit, "ether"), from: accounts[0] });
    const result = await multisigInstance.submitTransaction(
      accounts[4],
      web3.utils.toWei("2", "ether"),
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      { from: accounts[1] }
    );
    const result2 = await multisigInstance.confirmTransaction(0, { from: accounts[2] });
    truffleAssert.eventEmitted(result, "Submission");
    truffleAssert.eventEmitted(result2, "Execution");
    const balance = parseFloat(await web3.utils.fromWei(await web3.eth.getBalance(accounts[4])));
    assert.isAtLeast(balance, 10002);
  });
});
