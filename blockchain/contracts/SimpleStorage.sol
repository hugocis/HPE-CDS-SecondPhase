// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SimpleStorage
 * @dev A simple contract to store and retrieve a value
 */
contract SimpleStorage {
    // Variable to store the value
    uint256 private storedValue;

    // Event emitted when the value is changed
    event ValueChanged(uint256 newValue);

    /**
     * @dev Store a new value
     * @param value The value to store
     */
    function store(uint256 value) public {
        storedValue = value;
        emit ValueChanged(value);
    }

    /**
     * @dev Retrieve the stored value
     * @return The current stored value
     */
    function retrieve() public view returns (uint256) {
        return storedValue;
    }
}