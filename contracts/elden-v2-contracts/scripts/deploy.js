const { ethers, network, run } = require("hardhat");

const main = async () => {
  // Compile contracts
  

  // Deploy Hash Test
  const HashTest = await ethers.getContractFactory("HashTest");
  const hashTest = await HashTest.deploy();
  await hashTest.deployed();
  console.log("hashTest deployed to:", hashTest.address);

  const config = {
    treasuryAddress: "0xBEdD5546E9f70c226f234DE322d34408cA47134C",
    startTime: 1699216553
  }
  const weth = {
    address: "0x3e29b4AFcddb996715BF7E008D216A1eF4d20ec8"
  }

  // const eldenFactory = {
  //   address: "0xFf3a14ba6c2b7e28b58FD8bF5169F274B9561aB0"
  // }

  // Deploy EldenFactory
  console.log("Deploying EldenFactory..");
  const EldenFactory = await ethers.getContractFactory("EldenFactory");
  const eldenFactory = await EldenFactory.deploy(
    config.treasuryAddress // fee to address
  );
  await eldenFactory.deployed();
  console.log("EldenFactory:", eldenFactory.address);

  
  // Deploy EldenRouter
  console.log("Deploying EldenRouter..");
  const EldenRouter = await ethers.getContractFactory("EldenRouter");
  const eldenRouter = await EldenRouter.deploy(
    eldenFactory.address,  // factory
    weth.address   // weth
  );
  await eldenRouter.deployed();
  console.log("EldenRouter:", eldenRouter.address);


  const PositionHelper = await ethers.getContractFactory("PositionHelper");
  const positionHelper = await PositionHelper.deploy(
    eldenRouter.address,  // router
    weth.address   // weth
  );
  await positionHelper.deployed();
  console.log("PositionHelper deployed to:", positionHelper.address);

};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
