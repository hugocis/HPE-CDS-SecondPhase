import { expect } from "chai";
import { ethers } from "hardhat";
import { SimpleStorage } from "../typechain-types";

describe("SimpleStorage", function () {
  let simpleStorage: SimpleStorage;

  beforeEach(async function () {
    // Deploy a new SimpleStorage contract before each test
    const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
    simpleStorage = await SimpleStorage.deploy();
    await simpleStorage.waitForDeployment();
  });

  it("Should return 0 by default", async function () {
    expect(await simpleStorage.retrieve()).to.equal(0);
  });

  it("Should store and retrieve a value", async function () {
    // Store a value
    const storeValue = 42;
    await simpleStorage.store(storeValue);

    // Retrieve the value
    const value = await simpleStorage.retrieve();
    expect(value).to.equal(storeValue);
  });

  it("Should emit ValueChanged event when storing a value", async function () {
    const storeValue = 100;
    
    // Check if the event is emitted with the correct value
    await expect(simpleStorage.store(storeValue))
      .to.emit(simpleStorage, "ValueChanged")
      .withArgs(storeValue);
  });
});