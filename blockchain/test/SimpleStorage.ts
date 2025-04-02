import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("SimpleStorage", function () {
  async function deploySimpleStorageFixture() {
    const [owner] = await ethers.getSigners();
    const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
    const simpleStorage = await SimpleStorage.deploy();

    return { simpleStorage, owner };
  }

  it("Should return 0 by default", async function () {
    const { simpleStorage } = await loadFixture(deploySimpleStorageFixture);
    expect(await simpleStorage.retrieve()).to.equal(0n);
  });

  it("Should store and retrieve a value", async function () {
    const { simpleStorage } = await loadFixture(deploySimpleStorageFixture);
    const storeValue = 42n;
    await simpleStorage.store(storeValue);
    expect(await simpleStorage.retrieve()).to.equal(storeValue);
  });

  it("Should emit ValueChanged event when storing a value", async function () {
    const { simpleStorage } = await loadFixture(deploySimpleStorageFixture);
    const storeValue = 100n;
    await expect(simpleStorage.store(storeValue))
      .to.emit(simpleStorage, "ValueChanged")
      .withArgs(storeValue);
  });
});