import { ethers } from "hardhat";

async function main() {
  try {
    // Get the network and deployer account
    const [deployer] = await ethers.getSigners();
    
    console.log("Deploying contracts with account:", deployer.address);

    // Deploy UserRegistry
    const UserRegistry = await ethers.getContractFactory("UserRegistry");
    const registry = await UserRegistry.deploy();
    
    console.log("Waiting for UserRegistry deployment...");
    
    console.log("UserRegistry deployed to:", registry.target);
    
    return registry.target;
  } catch (error) {
    console.error("Deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });