// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title UserRegistry
 * @dev Manages user registration and their associated wallets
 */
contract UserRegistry {
    struct User {
        string username;
        bool isRegistered;
        uint256 registrationDate;
    }

    // Mapping from wallet address to User struct
    mapping(address => User) public users;
    // Mapping from username to wallet address
    mapping(string => address) public usernameToAddress;
    // Array to keep track of all registered addresses
    address[] public registeredAddresses;

    // Events
    event UserRegistered(address indexed userAddress, string username, uint256 timestamp);
    event UserUpdated(address indexed userAddress, string newUsername, uint256 timestamp);

    // Modifiers
    modifier onlyRegistered() {
        require(users[msg.sender].isRegistered, "Usuario no registrado");
        _;
    }

    modifier usernameAvailable(string memory username) {
        require(usernameToAddress[username] == address(0), "Nombre de usuario ya existe");
        _;
    }

    /**
     * @dev Register a new user
     * @param username The username for the new user
     */
    function registerUser(string memory username) public usernameAvailable(username) {
        require(!users[msg.sender].isRegistered, "Direccion ya registrada");
        require(bytes(username).length > 0, "El nombre de usuario no puede estar vacio");

        users[msg.sender] = User({
            username: username,
            isRegistered: true,
            registrationDate: block.timestamp
        });

        usernameToAddress[username] = msg.sender;
        registeredAddresses.push(msg.sender);

        emit UserRegistered(msg.sender, username, block.timestamp);
    }

    /**
     * @dev Update username for an existing user
     * @param newUsername The new username
     */
    function updateUsername(string memory newUsername) public onlyRegistered usernameAvailable(newUsername) {
        string memory oldUsername = users[msg.sender].username;
        delete usernameToAddress[oldUsername];
        
        users[msg.sender].username = newUsername;
        usernameToAddress[newUsername] = msg.sender;

        emit UserUpdated(msg.sender, newUsername, block.timestamp);
    }

    /**
     * @dev Check if an address is registered
     * @param userAddress The address to check
     * @return bool indicating if the address is registered
     */
    function isRegistered(address userAddress) public view returns (bool) {
        return users[userAddress].isRegistered;
    }

    /**
     * @dev Get user details by address
     * @param userAddress The address to query
     * @return username The username associated with the address
     * @return registrationDate The timestamp when the user registered
     */
    function getUserDetails(address userAddress) public view returns (
        string memory username,
        uint256 registrationDate
    ) {
        require(users[userAddress].isRegistered, "Usuario no encontrado");
        User memory user = users[userAddress];
        return (user.username, user.registrationDate);
    }

    /**
     * @dev Get wallet address by username
     * @param username The username to query
     * @return The associated wallet address
     */
    function getAddressByUsername(string memory username) public view returns (address) {
        address userAddress = usernameToAddress[username];
        require(userAddress != address(0), "Usuario no encontrado");
        return userAddress;
    }

    /**
     * @dev Get total number of registered users
     * @return The total number of registered users
     */
    function getTotalUsers() public view returns (uint256) {
        return registeredAddresses.length;
    }
}