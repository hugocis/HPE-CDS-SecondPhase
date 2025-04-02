// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SimpleStorage
 * @dev A simple contract to store and accumulate values
 */
contract SimpleStorage {
    // Variable to store the accumulated value
    uint256 private storedValue;

    // Event emitted when the value is changed, showing old and new values
    event ValueChanged(uint256 oldValue, uint256 newValue, uint256 addedValue);

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
     * @dev Retrieve the stored value
     * @return The current accumulated value
     */
    function retrieve() public view returns (uint256) {
        return storedValue;
    }
}