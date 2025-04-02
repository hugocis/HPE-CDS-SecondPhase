import { ethers } from "hardhat";
import * as fs from 'fs';
import * as path from 'path';

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

    // Save contract address
    const addressesPath = path.join(__dirname, '..', 'public', 'contract-addresses.json');
    let addresses: Record<string, string> = {};
    
    if (fs.existsSync(addressesPath)) {
      addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
    }
    
    addresses.userRegistry = await registry.getAddress();
    
    fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
    
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