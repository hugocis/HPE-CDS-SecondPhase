import { ethers } from "hardhat";

async function main() {
  console.log("Deploying SimpleStorage contract...");

  // Get the contract factory
  const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
  
  // Deploy the contract
  const simpleStorage = await SimpleStorage.deploy();
  await simpleStorage.waitForDeployment();

  console.log("SimpleStorage deployed to:", await simpleStorage.getAddress());
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });