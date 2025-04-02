import { ethers } from "hardhat";
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log("Deploying SimpleStorage contract...");
  const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
  const simpleStorage = await SimpleStorage.deploy();
  // In ethers v6, the contract is already deployed after deploy() completes

  console.log("SimpleStorage deployed to:", await simpleStorage.getAddress());

  // Save contract address
  const addressesPath = path.join(__dirname, '..', 'public', 'contract-addresses.json');
  let addresses: Record<string, string> = {};
  
  if (fs.existsSync(addressesPath)) {
    addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
  }
  
  addresses.simpleStorage = await simpleStorage.getAddress();
  
  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});