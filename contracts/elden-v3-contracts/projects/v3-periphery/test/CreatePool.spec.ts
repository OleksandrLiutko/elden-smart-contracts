import { ethers, waffle } from 'hardhat'
import { BigNumber, constants, Contract, ContractTransaction } from 'ethers'
import {
  IWETH9,
  MockTimeNonfungiblePositionManager,
  MockTimeSwapRouter,
  PairFlash,
  IEldenV3Pool,
  TestERC20,
  TestERC20Metadata,
  IEldenV3Factory,
  NFTDescriptor,
  Quoter,
  SwapRouter,
} from '../typechain-types'
import completeFixture from './shared/completeFixture'
import { FeeAmount, MaxUint128, TICK_SPACINGS } from './shared/constants'
import { encodePriceSqrt } from './shared/encodePriceSqrt'
import snapshotGasCost from './shared/snapshotGasCost'

import { expect } from './shared/expect'
import { getMaxTick, getMinTick } from './shared/ticks'
import { computePoolAddress } from './shared/computePoolAddress'

describe('PairFlash test', () => {
  const provider = waffle.provider
  const wallets = waffle.provider.getWallets()
  const wallet = wallets[0]

  let flash: PairFlash
  let nft: MockTimeNonfungiblePositionManager
  let token0: TestERC20
  let token1: TestERC20
  let factory: IEldenV3Factory
  let deployer: Contract
  let quoter: Quoter

  async function createPool(tokenAddressA: string, tokenAddressB: string, fee: FeeAmount, price: BigNumber) {
    if (tokenAddressA.toLowerCase() > tokenAddressB.toLowerCase())
      [tokenAddressA, tokenAddressB] = [tokenAddressB, tokenAddressA]

    await nft.createAndInitializePoolIfNecessary(tokenAddressA, tokenAddressB, fee, price)

    const liquidityParams = {
      token0: tokenAddressA,
      token1: tokenAddressB,
      fee: fee,
      tickLower: getMinTick(TICK_SPACINGS[fee]),
      tickUpper: getMaxTick(TICK_SPACINGS[fee]),
      recipient: wallet.address,
      amount0Desired: 1000000,
      amount1Desired: 1000000,
      amount0Min: 0,
      amount1Min: 0,
      deadline: 1,
    }

    return nft.mint(liquidityParams)
  }

  const flashFixture = async () => {
    const { router, tokens, factory, weth9, nft, deployer } = await completeFixture(wallets, provider)
    const token0 = tokens[0]
    const token1 = tokens[1]

    const flashContractFactory = await ethers.getContractFactory('PairFlash')
    const flash = (await flashContractFactory.deploy(
      router.address,
      deployer.address,
      factory.address,
      weth9.address
    )) as PairFlash

    const quoterFactory = await ethers.getContractFactory('Quoter')
    const quoter = (await quoterFactory.deploy(deployer.address, factory.address, weth9.address)) as Quoter

    return {
      token0,
      token1,
      flash,
      factory,
      weth9,
      nft,
      quoter,
      router,
      deployer,
    }
  }

  let loadFixture: ReturnType<typeof waffle.createFixtureLoader>

  before('create fixture loader', async () => {
    loadFixture = waffle.createFixtureLoader(wallets)
  })

  describe('flash', () => {
    it('test correct transfer events', async () => {
        ;({ factory, token0, token1, flash, nft, quoter, deployer } = await loadFixture(flashFixture))
    
        await token0.approve(nft.address, MaxUint128)
        await token1.approve(nft.address, MaxUint128)
        await createPool(token0.address, token1.address, FeeAmount.LOW, encodePriceSqrt(5, 10))
        await createPool(token0.address, token1.address, FeeAmount.MEDIUM, encodePriceSqrt(1, 1))
        await createPool(token0.address, token1.address, FeeAmount.HIGH, encodePriceSqrt(20, 10))
    })

  })
})
