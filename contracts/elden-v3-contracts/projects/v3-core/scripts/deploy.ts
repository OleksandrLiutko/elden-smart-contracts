import { tryVerify } from '@elden/common/verify'
import { ContractFactory } from 'ethers'
import { ethers, network } from 'hardhat'
import { sleep } from '@elden/common/sleep'
import fs from 'fs'

type ContractJson = { abi: any; bytecode: string }
const artifacts: { [name: string]: ContractJson } = {
  // eslint-disable-next-line global-require
  EldenV3PoolDeployer: require('../artifacts/contracts/EldenV3PoolDeployer.sol/EldenV3PoolDeployer.json'),
  // eslint-disable-next-line global-require
  EldenV3Factory: require('../artifacts/contracts/EldenV3Factory.sol/EldenV3Factory.json'),
}

async function main() {
  const [owner] = await ethers.getSigners()
  const networkName = network.name
  console.log('owner', owner.address)

  let eldenV3PoolDeployer_address = ''
  let eldenV3PoolDeployer
  const EldenV3PoolDeployer = new ContractFactory(
    artifacts.EldenV3PoolDeployer.abi,
    artifacts.EldenV3PoolDeployer.bytecode,
    owner
  )
  if (!eldenV3PoolDeployer_address) {
    eldenV3PoolDeployer = await EldenV3PoolDeployer.deploy()

    eldenV3PoolDeployer_address = eldenV3PoolDeployer.address
    console.log('eldenV3PoolDeployer', eldenV3PoolDeployer_address)
  } else {
    eldenV3PoolDeployer = new ethers.Contract(
      eldenV3PoolDeployer_address,
      artifacts.EldenV3PoolDeployer.abi,
      owner
    )
  }
  sleep(100)

  let eldenV3Factory_address = ''
  let eldenV3Factory
  if (!eldenV3Factory_address) {
    const EldenV3Factory = new ContractFactory(
      artifacts.EldenV3Factory.abi,
      artifacts.EldenV3Factory.bytecode,
      owner
    )
    eldenV3Factory = await EldenV3Factory.deploy(eldenV3PoolDeployer_address)

    eldenV3Factory_address = eldenV3Factory.address
    console.log('eldenV3Factory', eldenV3Factory_address)
  } else {
    eldenV3Factory = new ethers.Contract(eldenV3Factory_address, artifacts.EldenV3Factory.abi, owner)
  }
  sleep(100)

  // Set FactoryAddress for eldenV3PoolDeployer.
  await eldenV3PoolDeployer.setFactoryAddress(eldenV3Factory_address);


  const contracts = {
    EldenV3Factory: eldenV3Factory_address,
    EldenV3PoolDeployer: eldenV3PoolDeployer_address,
  }

  fs.writeFileSync(`./deployments/${networkName}.json`, JSON.stringify(contracts, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
