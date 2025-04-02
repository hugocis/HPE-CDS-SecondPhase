import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("SimpleStorage", function () {
  async function deploySimpleStorageFixture() {
    const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
    const simpleStorage = await SimpleStorage.deploy();
    return { simpleStorage };
  }

  describe("Deployment", function () {
    it("Should return 0 by default", async function () {
      const { simpleStorage } = await loadFixture(deploySimpleStorageFixture);
      expect(await simpleStorage.retrieve()).to.equal(0);
    });

    it("Should store and retrieve a value", async function () {
      const { simpleStorage } = await loadFixture(deploySimpleStorageFixture);
      const storeValue = 42;
      await simpleStorage.store(storeValue);
      expect(await simpleStorage.retrieve()).to.equal(storeValue);
    });

    it("Should emit ValueChanged event when storing a value", async function () {
      const { simpleStorage } = await loadFixture(deploySimpleStorageFixture);
      const storeValue = 100;
      await expect(simpleStorage.store(storeValue))
        .to.emit(simpleStorage, "ValueChanged")
        .withArgs(storeValue);
    });
  });
});