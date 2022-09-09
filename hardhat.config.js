/**
* @type import('hardhat/config').HardhatUserConfig
*/
require('dotenv').config();
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-web3");
require("@nomiclabs/hardhat-waffle");
const { API_URL_MUMBAI, API_URL_POLYGON, API_URL_OPTIGOERLI, PRIVATE_KEY, ETHERSCAN_API_KEY, POLYSCAN_API_KEY, OPTISCAN_API_KEY } = process.env;
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
    "optimism-goerli": {
      url: API_URL_OPTIGOERLI,
      accounts: [`0x${PRIVATE_KEY}`],
      gasMultiplier: 10,
      gasPrice: 1000000000 * 10,
      blockGasLimit: 0x1fffffffffffff
    },
    mumbai: {
      url: API_URL_MUMBAI,
      accounts: [`0x${PRIVATE_KEY}`]
      //gasMultiplier: 3,
      //gasPrice: 1000000000 * 2
    },
    polygon: {
      url: API_URL_POLYGON,
      accounts: [`0x${PRIVATE_KEY}`],
      gasPrice: 1000000000 * 40
    }
   },
   etherscan: {
    apiKey: ETHERSCAN_API_KEY
  }
}