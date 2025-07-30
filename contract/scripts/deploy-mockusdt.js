const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const MockUSDT = await hre.ethers.getContractFactory("MockUSDT");
  const mockUsdt = await MockUSDT.deploy();

  await mockUsdt.waitForDeployment();

  console.log("MockUSDT deployed to:", await mockUsdt.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});