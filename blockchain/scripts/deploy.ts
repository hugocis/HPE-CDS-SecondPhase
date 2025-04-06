import { ethers } from "hardhat";
import * as fs from 'fs';
import * as path from 'path';

interface ContractAddresses {
  simpleStorage?: string;
  userRegistry?: string;
}

async function main() {
  console.log("Deploying SimpleStorage contract...");
  const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
  const simpleStorage = await SimpleStorage.deploy();
  
  await simpleStorage.waitForDeployment();
  const address = await simpleStorage.getAddress();
  
  console.log("SimpleStorage deployed to:", address);

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
  
  addresses.simpleStorage = address;
  
  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
  console.log("Contract address saved to:", addressesPath);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});