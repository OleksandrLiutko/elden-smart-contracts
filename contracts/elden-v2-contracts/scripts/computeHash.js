const { ethers } = require('hardhat')
const PoolArtifact = require('../artifacts/contracts/EldenPair.sol/EldenPair.json')

const hash = ethers.utils.keccak256(PoolArtifact.bytecode)
console.log(hash)

