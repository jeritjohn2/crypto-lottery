const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  // Replace with actual USDT and wallet addresses for your network
  const usdtAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const walletAddress = "0x79f47536919166CAF62dC932165976539fC05465";

  const CryptoLottery = await hre.ethers.getContractFactory("CryptoLottery");
  const contract = await CryptoLottery.deploy(usdtAddress, walletAddress);

  await contract.waitForDeployment();

  console.log("CryptoLottery deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});