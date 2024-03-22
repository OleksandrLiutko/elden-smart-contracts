const { parseUnits, parseEther } = require("ethers/lib/utils");
const { ethers, upgrades } = require("hardhat");

async function main() {
  const _startTime = (Math.floor(Date.now() / 1000) + 3600 * 10).toString()
  console.log("Start Time: ", _startTime)
  const config = {
    treasuryAddress: "0xBEdD5546E9f70c226f234DE322d34408cA47134C",
    startTime: _startTime
  }
  // const weth = {
  //   address: '0x3e29b4AFcddb996715BF7E008D216A1eF4d20ec8'
  // }
  // const eldenToken = {
  //   address: '0xBfeE7D5987CC1e58126c5DCD444145633A58d30e'
  // }
  //   const eldenMaster = {
  //     address: '0x17621fB81F1B35A70477eC7145d7bD25e1A1EC49'
  //   }
  // const sEldenToken = {
  //   address: '0xc8B2e27B0E00eA9b7Cb07411f95d63a6E0b55c2b'
  // }

  const USDC = await ethers.getContractFactory("MockERC20")
  const usdc = await USDC.deploy("USD Coin", "USDC", 6, parseUnits("100000000000", 6))
  await usdc.deployed()
  console.log("USDC: ", usdc.address)

  const USDT = await ethers.getContractFactory("MockERC20")
  const usdt = await USDT.deploy("Tether USD", "USDT", 18, parseUnits("100000000000", 18))
  await usdt.deployed()
  console.log("USDT: ", usdt.address)

  const WrappedEther = await ethers.getContractFactory("WrappedEther")
  const weth = await WrappedEther.deploy()
  await weth.deployed()
  console.log("WETH: ", weth.address)

  const EldenToken = await ethers.getContractFactory("EldenToken");
  const eldenToken = await EldenToken.deploy(
    ethers.utils.parseEther("1000000"), // max supply
    ethers.utils.parseEther("500000"), // initial rate
    ethers.utils.parseEther("0.001"), // emission rate
    config.treasuryAddress // treasury address
  );
  await eldenToken.deployed()
  console.log("EldenToken: ", eldenToken.address)

  const SEldenToken = await ethers.getContractFactory("SEldenToken");
  const sEldenToken = await SEldenToken.deploy(
    eldenToken.address // elden token address
  );
  await sEldenToken.deployed()
  console.log("SEldenToken: ", sEldenToken.address)

  const EldenMaster = await ethers.getContractFactory("EldenMaster");
  const eldenMaster = await EldenMaster.deploy(
    eldenToken.address, // elden token address
    config.startTime // start time
  );
  await eldenMaster.deployed()
  console.log("EldenMaster: ", eldenMaster.address)

  const NFTPoolFactory = await ethers.getContractFactory("NFTPoolFactory");
  const nftPoolFactory = await NFTPoolFactory.deploy(
    eldenMaster.address, // master
    eldenToken.address, // elden token
    sEldenToken.address // sElden token
  );
  await nftPoolFactory.deployed()
  console.log("NFTPoolFactory: ", nftPoolFactory.address)

  const YieldBooster = await ethers.getContractFactory("YieldBooster");
  const yieldBooster = await YieldBooster.deploy(
    sEldenToken.address // sElden token
  );
  await yieldBooster.deployed()
  console.log("YieldBooster: ", yieldBooster.address)

  const Dividends = await ethers.getContractFactory("Dividends");
  const dividends = await Dividends.deploy(
    sEldenToken.address, // sElden token
    config.startTime // start time
  );
  await dividends.deployed()
  console.log("Dividends: ", dividends.address)

  const Launchpad = await ethers.getContractFactory("Launchpad");
  const launchpad = await Launchpad.deploy(
    sEldenToken.address, // sElden token
  );
  await launchpad.deployed()
  console.log("Launchpad: ", launchpad.address)

  const RunePoolFactory = await ethers.getContractFactory("RunePoolFactory");
  const runePoolFactory = await RunePoolFactory.deploy(
    eldenToken.address, 
    sEldenToken.address, 
    config.treasuryAddress, 
    config.treasuryAddress
  );
  await runePoolFactory.deployed()
  console.log("runePoolFactory: ", runePoolFactory.address)


  ///////////////////////////////////////////////////////////////
  //////////   Setting contracts
  //////////////////////////////////////////////////////////////
  await eldenToken.updateAllocations(67,0)
  await eldenToken.initializeEmissionStart(config.startTime)
  await eldenToken.initializeMasterAddress(eldenMaster.address)
  console.log("Setting 1 Pass")
  // await sEldenToken.updateRedeemSettings(50,100,3600,86400,50)   /// for test
  await sEldenToken.updateDividendsAddress(dividends.address)
  await sEldenToken.updateDeallocationFee(dividends.address, 50)
  await sEldenToken.updateDeallocationFee(yieldBooster.address, 50)
  await sEldenToken.updateDeallocationFee(launchpad.address, 50)

  console.log("Setting 2 Pass")
  await sEldenToken.updateTransferWhitelist(dividends.address, true)

  await eldenMaster.setYieldBooster(yieldBooster.address)
  console.log("Setting 3 Pass")
  //////////////////////////////////////////
  /////// Manual Setting
  //////////////////////////////////////////
  // await dividends.enableDistributedToken(sEldenToken.address)
  // await dividends.enableDistributedToken(ETH/USDT address)
  // await dividends.addDividendsToPending(sEldenToken.address, amount)
  // await dividends.addDividendsToPending(ETH/USDT address, amount)


  // await eldenMaster.add(NFTPool, allocpoint, update)

  // for each pools that you created just now
  // runePool.addRewards(amounttoken1, amounttoken2)
  // runePool.publish


  
  const FairAuction = await ethers.getContractFactory("FairAuction");
  const auction = await FairAuction.deploy(
    weth.address, // WETH address
    eldenToken.address, // project token1
    ethers.constants.AddressZero, // project token2
    weth.address, // sale token
    config.startTime, // start time
    (Number(config.startTime) + 86400 * 10).toString(), // end time
    config.treasuryAddress, // treasury address
    parseUnits("300000", 18), // max tokens1 to distribute
    0, // max tokens2 to distribute
    parseUnits("0.2", 18), // min raise 
    parseUnits("0.5", 18), // max raise
    parseEther("0.2") // cap per wallet
  );
  await auction.deployed()
  console.log("FairAuction: ", auction.address)



}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
