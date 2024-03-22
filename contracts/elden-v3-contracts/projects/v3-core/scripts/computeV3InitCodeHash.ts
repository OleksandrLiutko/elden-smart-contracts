import { ethers } from 'hardhat'
import EldenV3PoolArtifact from '../artifacts/contracts/EldenV3Pool.sol/EldenV3Pool.json'

const hash = ethers.utils.keccak256(EldenV3PoolArtifact.bytecode)
console.log(hash)
