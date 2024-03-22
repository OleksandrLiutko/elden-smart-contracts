import { abi as POOL_ABI } from '@elden/v3-core/artifacts/contracts/EldenV3Pool.sol/EldenV3Pool.json'
import { Contract, Wallet } from 'ethers'
import { IEldenV3Pool } from '../../typechain-types'

export default function poolAtAddress(address: string, wallet: Wallet): IEldenV3Pool {
  return new Contract(address, POOL_ABI, wallet) as IEldenV3Pool
}
