import { ethers } from "hardhat";
import * as fs from 'fs';
import * as path from 'path';

interface ContractAddresses {
  simpleStorage?: string;
  userRegistry?: string;
}

async function main() {
  try {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    const UserRegistry = await ethers.getContractFactory("UserRegistry");
    const registry = await UserRegistry.deploy();
    
    await registry.waitForDeployment();
    const address = await registry.getAddress();
    
    console.log("UserRegistry deployed to:", address);

    // Asegurar que el directorio public existe
    const publicDir = path.join(__dirname, '..', 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir);
    }

    // Guardar dirección del contrato
    const addressesPath = path.join(publicDir, 'contract-addresses.json');
    let addresses: ContractAddresses = {};
    
    if (fs.existsSync(addressesPath)) {
      addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
    }
    
    addresses.userRegistry = address;
    
    fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
    console.log("Contract address saved to:", addressesPath);
    
    return address;
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