import { BigNumber } from 'ethers'
import { ethers } from 'hardhat'
import { MockTimeEldenV3Pool } from '../../typechain-types/contracts/test/MockTimeEldenV3Pool'
import { TestERC20 } from '../../typechain-types/contracts/test/TestERC20'
import { EldenV3Factory } from '../../typechain-types/contracts/EldenV3Factory'
import { EldenV3PoolDeployer } from '../../typechain-types/contracts/EldenV3PoolDeployer'
import { TestEldenV3Callee } from '../../typechain-types/contracts/test/TestEldenV3Callee'
import { TestEldenV3Router } from '../../typechain-types/contracts/test/TestEldenV3Router'
import { MockTimeEldenV3PoolDeployer } from '../../typechain-types/contracts/test/MockTimeEldenV3PoolDeployer'
import EldenV3LmPoolArtifact from '@elden/v3-lm-pool/artifacts/contracts/EldenV3LmPool.sol/EldenV3LmPool.json'

import { Fixture } from 'ethereum-waffle'

interface FactoryFixture {
  factory: EldenV3Factory
}

interface DeployerFixture {
  deployer: EldenV3PoolDeployer
}

async function factoryFixture(): Promise<FactoryFixture> {
  const { deployer } = await deployerFixture()
  const factoryFactory = await ethers.getContractFactory('EldenV3Factory')
  const factory = (await factoryFactory.deploy(deployer.address)) as EldenV3Factory
  return { factory }
}
async function deployerFixture(): Promise<DeployerFixture> {
  const deployerFactory = await ethers.getContractFactory('EldenV3PoolDeployer')
  const deployer = (await deployerFactory.deploy()) as EldenV3PoolDeployer
  return { deployer }
}

interface TokensFixture {
  token0: TestERC20
  token1: TestERC20
  token2: TestERC20
}

async function tokensFixture(): Promise<TokensFixture> {
  const tokenFactory = await ethers.getContractFactory('TestERC20')
  const tokenA = (await tokenFactory.deploy(BigNumber.from(2).pow(255))) as TestERC20
  const tokenB = (await tokenFactory.deploy(BigNumber.from(2).pow(255))) as TestERC20
  const tokenC = (await tokenFactory.deploy(BigNumber.from(2).pow(255))) as TestERC20

  const [token0, token1, token2] = [tokenA, tokenB, tokenC].sort((tokenA, tokenB) =>
    tokenA.address.toLowerCase() < tokenB.address.toLowerCase() ? -1 : 1
  )

  return { token0, token1, token2 }
}

type TokensAndFactoryFixture = FactoryFixture & TokensFixture

interface PoolFixture extends TokensAndFactoryFixture {
  swapTargetCallee: TestEldenV3Callee
  swapTargetRouter: TestEldenV3Router
  createPool(
    fee: number,
    tickSpacing: number,
    firstToken?: TestERC20,
    secondToken?: TestERC20
  ): Promise<MockTimeEldenV3Pool>
}

// Monday, October 5, 2020 9:00:00 AM GMT-05:00
export const TEST_POOL_START_TIME = 1601906400

export const poolFixture: Fixture<PoolFixture> = async function (): Promise<PoolFixture> {
  const { factory } = await factoryFixture()
  const { token0, token1, token2 } = await tokensFixture()

  const MockTimeEldenV3PoolDeployerFactory = await ethers.getContractFactory('MockTimeEldenV3PoolDeployer')
  const MockTimeEldenV3PoolFactory = await ethers.getContractFactory('MockTimeEldenV3Pool')

  const calleeContractFactory = await ethers.getContractFactory('TestEldenV3Callee')
  const routerContractFactory = await ethers.getContractFactory('TestEldenV3Router')

  const swapTargetCallee = (await calleeContractFactory.deploy()) as TestEldenV3Callee
  const swapTargetRouter = (await routerContractFactory.deploy()) as TestEldenV3Router

  const EldenV3LmPoolFactory = await ethers.getContractFactoryFromArtifact(EldenV3LmPoolArtifact)

  return {
    token0,
    token1,
    token2,
    factory,
    swapTargetCallee,
    swapTargetRouter,
    createPool: async (fee, tickSpacing, firstToken = token0, secondToken = token1) => {
      const mockTimePoolDeployer =
        (await MockTimeEldenV3PoolDeployerFactory.deploy()) as MockTimeEldenV3PoolDeployer
      const tx = await mockTimePoolDeployer.deploy(
        factory.address,
        firstToken.address,
        secondToken.address,
        fee,
        tickSpacing
      )

      const receipt = await tx.wait()
      const poolAddress = receipt.events?.[0].args?.pool as string

      const mockTimeEldenV3Pool = MockTimeEldenV3PoolFactory.attach(poolAddress) as MockTimeEldenV3Pool

      await (
        await factory.setLmPool(
          poolAddress,
          (
            await EldenV3LmPoolFactory.deploy(
              poolAddress,
              ethers.constants.AddressZero,
              Math.floor(Date.now() / 1000)
            )
          ).address
        )
      ).wait()

      return mockTimeEldenV3Pool
    },
  }
}
