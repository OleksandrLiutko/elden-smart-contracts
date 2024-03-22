import { tryVerify } from '@elden/common/verify'
import { ContractFactory } from 'ethers'
import { ethers, network } from 'hardhat'
import { sleep } from '@elden/common/sleep'
import fs from 'fs'

type ContractJson = { abi: any; bytecode: string }
const artifacts: { [name: string]: ContractJson } = {
  // eslint-disable-next-line global-require
  EldenStableSwapLPFactory: require('../artifacts/contracts/EldenStableSwapLPFactory.sol/EldenStableSwapLPFactory.json'),
  // eslint-disable-next-line global-require
  EldenStableSwapTwoPoolDeployer: require('../artifacts/contracts/EldenStableSwapTwoPoolDeployer.sol/EldenStableSwapTwoPoolDeployer.json'),
  // eslint-disable-next-line global-require
  EldenStableSwapThreePoolDeployer: require('../artifacts/contracts/EldenStableSwapThreePoolDeployer.sol/EldenStableSwapThreePoolDeployer.json'),
  // eslint-disable-next-line global-require
  EldenStableSwapFactory: require('../artifacts/contracts/EldenStableSwapFactory.sol/EldenStableSwapFactory.json'),
  // eslint-disable-next-line global-require
  EldenStableSwapTwoPoolInfo: require('../artifacts/contracts/EldenStableSwapTwoPoolInfo.sol/EldenStableSwapTwoPoolInfo.json'),
  // eslint-disable-next-line global-require
  EldenStableSwapInfo: require('../artifacts/contracts/EldenStableSwapInfo.sol/EldenStableSwapInfo.json'),
  // eslint-disable-next-line global-require
  EldenStableSwapLP: require('../artifacts/contracts/EldenStableSwapLP.sol/EldenStableSwapLP.json'),
  // eslint-disable-next-line global-require
  EldenStableSwapTwoPool: require('../artifacts/contracts/EldenStableSwapTwoPool.sol/EldenStableSwapTwoPool.json'),
}

async function main() {
  const [owner] = await ethers.getSigners()
  const networkName = network.name
  console.log('owner', owner.address)

  let eldenStableSwapLPFactory_address = ''
  let eldenStableSwapLPFactoryDeployer
  const EldenStableSwapLPFactory = new ContractFactory(
    artifacts.EldenStableSwapLPFactory.abi,
    artifacts.EldenStableSwapLPFactory.bytecode,
    owner
  )
  if (!eldenStableSwapLPFactory_address) {
    eldenStableSwapLPFactoryDeployer = await EldenStableSwapLPFactory.deploy()

    eldenStableSwapLPFactory_address = eldenStableSwapLPFactoryDeployer.address
    console.log('eldenStableSwapLPFactory', eldenStableSwapLPFactory_address)
  } else {
    eldenStableSwapLPFactoryDeployer = new ethers.Contract(
      eldenStableSwapLPFactory_address,
      artifacts.EldenStableSwapLPFactory.abi,
      owner
    )
  }
  sleep(100)

  let eldenStableSwapTwoPoolDeployer_address = ''
  let eldenStableSwapTwoPoolDeployerDeployer
  const EldenStableSwapTwoPoolDeployer = new ContractFactory(
    artifacts.EldenStableSwapTwoPoolDeployer.abi,
    artifacts.EldenStableSwapTwoPoolDeployer.bytecode,
    owner
  )
  if (!eldenStableSwapTwoPoolDeployer_address) {
    eldenStableSwapTwoPoolDeployerDeployer = await EldenStableSwapTwoPoolDeployer.deploy()

    eldenStableSwapTwoPoolDeployer_address = eldenStableSwapTwoPoolDeployerDeployer.address
    console.log('eldenStableSwapTwoPoolDeployerDeployer', eldenStableSwapTwoPoolDeployer_address)
  } else {
    eldenStableSwapTwoPoolDeployerDeployer = new ethers.Contract(
      eldenStableSwapTwoPoolDeployer_address,
      artifacts.EldenStableSwapTwoPoolDeployer.abi,
      owner
    )
  }
  sleep(100)

  let eldenStableSwapThreePoolDeployer_address = ''
  let eldenStableSwapThreePoolDeployerDeployer
  const EldenStableSwapThreePoolDeployer = new ContractFactory(
    artifacts.EldenStableSwapThreePoolDeployer.abi,
    artifacts.EldenStableSwapThreePoolDeployer.bytecode,
    owner
  )
  if (!eldenStableSwapThreePoolDeployer_address) {
    eldenStableSwapThreePoolDeployerDeployer = await EldenStableSwapThreePoolDeployer.deploy()

    eldenStableSwapThreePoolDeployer_address = eldenStableSwapThreePoolDeployerDeployer.address
    console.log('eldenStableSwapThreePoolDeployerDeployer', eldenStableSwapThreePoolDeployer_address)
  } else {
    eldenStableSwapThreePoolDeployerDeployer = new ethers.Contract(
      eldenStableSwapThreePoolDeployer_address,
      artifacts.EldenStableSwapThreePoolDeployer.abi,
      owner
    )
  }
  sleep(100)

  let eldenStableSwapFactory_address = ''
  let eldenStableSwapFactoryDeployer
  const EldenStableSwapFactory = new ContractFactory(
    artifacts.EldenStableSwapFactory.abi,
    artifacts.EldenStableSwapFactory.bytecode,
    owner
  )
  if (!eldenStableSwapFactory_address) {
    eldenStableSwapFactoryDeployer = await EldenStableSwapFactory.deploy(
      eldenStableSwapLPFactory_address,
      eldenStableSwapTwoPoolDeployer_address,
      eldenStableSwapThreePoolDeployer_address
    )

    eldenStableSwapFactory_address = eldenStableSwapFactoryDeployer.address
    console.log('eldenStableSwapFactoryDeployer', eldenStableSwapFactory_address)
  } else {
    eldenStableSwapFactoryDeployer = new ethers.Contract(
      eldenStableSwapFactory_address,
      artifacts.EldenStableSwapFactory.abi,
      owner
    )
  }
  sleep(100)


  let eldenStableSwapTwoPoolInfo_address = ''
  let eldenStableSwapTwoPoolInfoDeployer
  const EldenStableSwapTwoPoolInfo = new ContractFactory(
    artifacts.EldenStableSwapTwoPoolInfo.abi,
    artifacts.EldenStableSwapTwoPoolInfo.bytecode,
    owner
  )
  if (!eldenStableSwapTwoPoolInfo_address) {
    eldenStableSwapTwoPoolInfoDeployer = await EldenStableSwapTwoPoolInfo.deploy()

    eldenStableSwapTwoPoolInfo_address = eldenStableSwapTwoPoolInfoDeployer.address
    console.log('eldenStableSwapTwoPoolInfoDeployer', eldenStableSwapTwoPoolInfo_address)
  } else {
    eldenStableSwapTwoPoolInfoDeployer = new ethers.Contract(
      eldenStableSwapTwoPoolInfo_address,
      artifacts.EldenStableSwapTwoPoolInfo.abi,
      owner
    )
  }
  

  const EldenStableSwapInfo = new ContractFactory(
    artifacts.EldenStableSwapInfo.abi,
    artifacts.EldenStableSwapInfo.bytecode,
    owner
  )
  const eldenStableSwapInfo = await EldenStableSwapInfo.deploy()



  const contracts = {
    EldenStableSwapLPFactory: eldenStableSwapLPFactory_address,
    EldenStableSwapTwoPoolDeployer: eldenStableSwapTwoPoolDeployer_address,
    EldenStableSwapThreePoolDeployer: eldenStableSwapThreePoolDeployer_address,
    EldenStableSwapFactory: eldenStableSwapFactory_address,
    EldenStableSwapTwoPoolInfo: eldenStableSwapTwoPoolInfo_address,
    EldenStableSwapInfo: eldenStableSwapInfo.address
  }

  fs.writeFileSync(`./deployments/${networkName}.json`, JSON.stringify(contracts, null, 2))

  
  await eldenStableSwapLPFactoryDeployer.transferOwnership(eldenStableSwapFactory_address)
  sleep(100)

  await eldenStableSwapTwoPoolDeployerDeployer.transferOwnership(eldenStableSwapFactory_address)
  sleep(100)

  await eldenStableSwapThreePoolDeployerDeployer.transferOwnership(eldenStableSwapFactory_address)
  sleep(100)

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
