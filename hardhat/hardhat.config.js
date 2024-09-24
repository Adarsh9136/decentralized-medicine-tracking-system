/** @type import('hardhat/config').HardhatUserConfig */

require("@nomiclabs/hardhat-waffle")

const ALCHEMY_API_KEY = "ALCHEMY_API_KEY";
const SEPOLIA_PRIVATE_KEY= "SEPOLIA_PRIVATE_KEY";
module.exports = {
  solidity: "0.8.24",

  networks:{
    sepolia:{
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts:[`${SEPOLIA_PRIVATE_KEY}`]
    }
  }
};
