
require('@nomiclabs/hardhat-ethers');
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
// require('@openzeppelin/hardhat-upgrades');
require("dotenv").config();
require("hardhat-gas-reporter");



// const { privatekey } = require('./.env.json');

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();
  
  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  plugins: [
    // ...
    "hardhat-gas-reporter",
  ],
  solidity: {
    compilers: [
      {
        version: "0.4.18",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        },
      },
      {
        version: "0.5.16",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        },
      },
      {
        version: "0.6.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        },
      },
      {
        version: "0.6.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        },
      },
      {
        version: "0.7.5",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        },
      },
      {
        version: "0.7.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        },
      },
      {
        version: "0.8.7",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        },
      },
      {
        version: "0.8.10",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        },
      },
      {
        version: "0.8.17",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        },
      },
      {
        version: "0.8.18",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        },
      },
      {
        version: "0.8.4",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
        contractSizer: {
          alphaSort: true,
          runOnCompile: true,
          disambiguatePaths: false,
        },
      },
    ],
  },
  networks: {
    mainnet: {
      url: process.env.MAINNET_URL || "",
      // accounts: {mnemonic: process.env.MNEMONIC,}
      accounts: [process.env.PRIVATE_KEY]
    },
    goerli: {
      url: process.env.GOERLI_URL || "",
      gasPrice: 500000000000,
      // accounts: {mnemonic: process.env.MNEMONIC,}
      accounts: [process.env.PRIVATE_KEY]
    },
    ropsten: {
      url: process.env.ROPSTEN_URL || "",
      // accounts: {mnemonic: process.env.MNEMONIC,}
      accounts: [process.env.PRIVATE_KEY]
    },
    rinkeby: {
      url: process.env.RINKEBY_URL || "",
      // accounts: {mnemonic: process.env.MNEMONIC,}
      accounts: [process.env.PRIVATE_KEY]
    },
    polygon: {
      url: process.env.MATIC_URL || "",
      // accounts: {mnemonic: process.env.MNEMONIC,}
      accounts: [process.env.PRIVATE_KEY]
    },
    mumbai: {
      url: process.env.MUMBAI_URL || "",
      // accounts: {mnemonic: process.env.MNEMONIC,}
      accounts: [process.env.PRIVATE_KEY]
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    scrollSepolia: {
      url: "https://sepolia-rpc.scroll.io",
      chainId: 534351,
      accounts: [process.env.PRIVATE_KEY],
    },
    base: {
      url: "https://mainnet.base.org",
      chainId: 8453,
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 1000000000,
    },
    baseGoerli: {
      url: "https://goerli.base.org",
      chainId: 84531,
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 1000000000,
    },
    fuji: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      chainId: 43113,
      gasPrice: 200000000000,
      accounts: [process.env.PRIVATE_KEY],
    },
    avax: {
      url: "https://api.avax.network/ext/bc/C/rpc",
      gasPrice: 25000000000,
      chainId: 43114,
      accounts: [process.env.PRIVATE_KEY],
    },
    butane: {
      url: "https://mainnet-rpc.bbcscan.io",
      chainId: 1978,
      accounts: [process.env.PRIVATE_KEY],
    },
    butaneTestnet: {
      url: "https://testnet-rpc.bbcscan.io",
      chainId: 197978,
      accounts: [process.env.PRIVATE_KEY],
    },

    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      gasPrice: 30000000000,
      // accounts: {privatekey: privatekey},
      // accounts: {mnemonic: process.env.MNEMONIC,}
      accounts: [process.env.PRIVATE_KEY]
    },
    bsc: {
      url: "https://bsc-dataseed.binance.org/",
      chainId: 56,
      gasPrice: 30000000000,
      // accounts: {mnemonic: process.env.MNEMONIC,}
      accounts: [process.env.PRIVATE_KEY]
    },

    ftmTestnet: {
      url: "https://rpc.testnet.fantom.network/",
      chainId: 4002,
      // gasPrice: 30000000000,
      live: false,
      saveDeployments: true,
      gasMultiplier: 2,
      // accounts: {privatekey: privatekey},
      // accounts: {mnemonic: process.env.MNEMONIC,}
      accounts: [process.env.PRIVATE_KEY]
    },
    opera: {
      url: "https://rpcapi.fantom.network/",
      chainId: 250,
      // gasPrice: 30000000000,
      live: false,
      saveDeployments: true,
      gasMultiplier: 2,
      // accounts: {privatekey: privatekey},
      // accounts: {mnemonic: process.env.MNEMONIC,}
      accounts: [process.env.PRIVATE_KEY]
    },

    oasisTestnet: {
      url: "https://testnet.emerald.oasis.dev/",
      chainId: 42261,
      gasPrice: 30000000000,
      // accounts: {mnemonic: process.env.MNEMONIC,}
      accounts: [process.env.PRIVATE_KEY]
    },

    oasisMainnet: {
      url: "https://emerald.oasis.dev/",
      chainId: 42262,
      gasPrice: 30000000000,
      // accounts: {mnemonic: process.env.MNEMONIC,}
      accounts: [process.env.PRIVATE_KEY]
    },
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    gasPrice: 1000,
  },
  etherscan: {
    apiKey: 
    {
      mainnet: process.env.ETHERSCAN_API_KEY,
      goerli: process.env.ETHERSCAN_API_KEY,
      rinkeby: process.env.ETHERSCAN_API_KEY,
      ropsten: process.env.ETHERSCAN_API_KEY,
      polygon: process.env.MATIC_API_KEY,
      polygonMumbai: process.env.MATIC_API_KEY,
      bsc: process.env.BSCSCAN_API_KEY,
      bscTestnet: process.env.BSCSCAN_API_KEY,
      ftmTestnet: process.env.FTMSCAN_API_KEY,
      avalancheFujiTestnet: process.env.AVAXSCAN_API_KEY,
      avalanche: process.env.AVAXSCAN_API_KEY,
      butaneTestnet: process.env.BUTANE_API_KEY,
      butane: process.env.BUTANE_API_KEY,
      scrollSepolia: process.env.SCROLL_TEST_API_KEY,
      base: process.env.BASE_GOERLI_API_KEY,
      baseGoerli: process.env.BASE_GOERLI_API_KEY,
    },
    customChains: [
      {
        network: "butaneTestnet",
        chainId: 197978,
        urls: {
          apiURL: "https://testnet.bbcscan.io/api",
          browserURL: "https://bbcscan.io"
        }
      },
      // {
      //   network: 'scrollSeplia',
      //   chainId: 534351,
      //   urls: {
      //     apiURL: 'https://sepolia-blockscout.scroll.io/api',
      //     browserURL: 'https://sepolia-blockscout.scroll.io/',
      //   },
      // },
      {
        network: 'scrollSepolia',
        chainId: 534351,
        urls: {
          apiURL: 'https://api-sepolia.scrollscan.com/api',
          browserURL: 'https://sepolia.scrollscan.com/',
        },
      },
      {
        network: 'baseGoerli',
        chainId: 84531,
        urls: {
          apiURL: 'https://api-goerli.basescan.org/api',
          browserURL: 'https://basescan.org/',
        },
      },
      {
        network: 'base',
        chainId: 8453,
        urls: {
          apiURL: 'https://api.basescan.org/api',
          browserURL: 'https://basescan.org/',
        },
      },
      {
        network: "butane",
        chainId: 1978,
        urls: {
          apiURL: "https://bbcscan.io/api",
          browserURL: "https://bbcscan.io"
        }
      }
    ]
  },

};
