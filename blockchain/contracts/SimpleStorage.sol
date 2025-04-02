// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SimpleStorage
 * @dev A simple contract to store, accumulate and burn values
 */
contract SimpleStorage {
    // Variable to store the accumulated value
    uint256 private storedValue;

    // Events
    event ValueChanged(uint256 oldValue, uint256 newValue, uint256 addedValue);
    event ValueBurned(uint256 oldValue, uint256 newValue, uint256 burnedAmount);

    /**
     * @dev Add a new value to the existing stored value
     * @param value The value to add to the existing stored value
     */
    function store(uint256 value) public {
        uint256 oldValue = storedValue;
        storedValue += value;
        emit ValueChanged(oldValue, storedValue, value);
    }

    /**
     * @dev Burn (subtract) a value from the stored amount
     * @param amount The amount to burn
     */
    function burn(uint256 amount) public {
        require(amount <= storedValue, "Cannot burn more than the stored value");
        uint256 oldValue = storedValue;
        storedValue -= amount;
        emit ValueBurned(oldValue, storedValue, amount);
    }

    /**
     * @dev Retrieve the stored value
     * @return The current accumulated value
     */
    function retrieve() public view returns (uint256) {
        return storedValue;
    }
}