const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  // Replace with actual USDT and wallet addresses for your network
  const usdtAddress = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6";
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