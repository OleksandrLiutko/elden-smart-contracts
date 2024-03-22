import { verifyContract } from '@elden/common/verify'
import { sleep } from '@elden/common/sleep'

async function main() {
  const networkName = network.name
  const deployedContracts = await import(`@elden/v3-core/deployments/${networkName}.json`)

  // Verify EldenStableSwapLPFactory
  console.log('Verify EldenStableSwapLPFactory')
  await verifyContract(deployedContracts.EldenStableSwapLPFactory)
  await sleep(10000)

  // // Verify eldenV3Factory
  // console.log('Verify eldenV3Factory')
  // await verifyContract(deployedContracts.EldenV3Factory, [deployedContracts.EldenStableSwapLPFactory])
  // await sleep(10000)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
