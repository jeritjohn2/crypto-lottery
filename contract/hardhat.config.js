require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // to load PRIVATE_KEY from .env

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    bnbTestnet: {
      url: "https://bsc-prebsc-dataseed.bnbchain.org",
      chainId: 97,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};