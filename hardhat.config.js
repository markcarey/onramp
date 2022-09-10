/**
* @type import('hardhat/config').HardhatUserConfig
*/
require('dotenv').config();
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-web3");
require("@nomiclabs/hardhat-waffle");
const { API_URL_MUMBAI, API_URL_POLYGON, API_URL_GOERLI, API_URL_OPTIGOERLI, PRIVATE_KEY, ETHERSCAN_API_KEY, POLYSCAN_API_KEY, OPTISCAN_API_KEY } = process.env;
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.2",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1
          }
        }
      },
      {
        version: "0.8.15",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1
          }
        }
      },
      {
        version: "0.4.11",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1
          }
        }
      }
    ] 
},
   defaultNetwork: "mumbai",
   networks: {
    hardhat: {
      accounts: [{ privateKey: `0x${PRIVATE_KEY}`, balance: "10000000000000000000000"}],
      forking: {
        url: API_URL_POLYGON,
        blockNumber: 25689025  // assumes polygon fork
      },
      loggingEnabled: true,
      gasMultiplier: 7,
      gasPrice: 1000000000 * 5,
      blockGasLimit: 0x1fffffffffffff
    },
    goerli: {
      url: API_URL_GOERLI,
      accounts: [`0x${PRIVATE_KEY}`],
      gasMultiplier: 10,
      gasPrice: 1000000000 * 10,
      blockGasLimit: 0x1fffffffffffff
    },
    "optimism-goerli": {
      url: API_URL_OPTIGOERLI,
      accounts: [`0x${PRIVATE_KEY}`],
      gasMultiplier: 10,
      gasPrice: 1000000000 * 10,
      blockGasLimit: 0x1fffffffffffff
    },
    mumbai: {
      url: API_URL_MUMBAI,
      accounts: [`0x${PRIVATE_KEY}`],
      gasPrice: 1000000000 * 40
    },
    polygon: {
      url: API_URL_POLYGON,
      accounts: [`0x${PRIVATE_KEY}`],
      gasPrice: 1000000000 * 40
    }
   },
   etherscan: {
    apiKey: POLYSCAN_API_KEY
  }
}

// npx hardhat verify --network goerli 0x8c1d64d775E3D9DDe94b9dca2C6D9C7B3957Dfd4 0xB4C1340434920d70aD774309C75f9a4B679d801e 0xD25575eD38fa0F168c9Ba4E61d887B6b3433F350
// npx hardhat verify --network mumbai 0x05cf6458703b6701BaBd0aF8A6375B1b80a28fe3 0x0000000000000000000000000000000000000000 0x0000000000000000000000000000000000000000