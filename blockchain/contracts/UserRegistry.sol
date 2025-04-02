// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserRegistry {
    struct User {
        string username;
        bool isRegistered;
        uint256 registrationDate;
        bool isGeneratedWallet;  // true si la cartera fue generada por el sistema
        address linkedWallet;    // dirección de la cartera vinculada (si existe)
    }

    // Mappings principales
    mapping(address => User) public users;
    mapping(string => address) public usernameToAddress;
    address[] public registeredAddresses;

    // Events
    event UserRegistered(address indexed userAddress, string username, uint256 timestamp, bool isGeneratedWallet);
    event UserUpdated(address indexed userAddress, string newUsername, uint256 timestamp);
    event WalletGenerated(address indexed userAddress, string username);
    event WalletLinked(address indexed userAddress, address indexed linkedWallet, string username);

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
     * @dev Registrar un nuevo usuario con cartera existente (MetaMask)
     */
    function registerWithExistingWallet(string memory username) public usernameAvailable(username) {
        require(!users[msg.sender].isRegistered, "Direccion ya registrada");
        require(bytes(username).length > 0, "El nombre de usuario no puede estar vacio");

        _createUser(msg.sender, username, false, address(0));
    }

    /**
     * @dev Registrar un nuevo usuario con cartera generada
     * @param username Nombre de usuario
     * @param generatedAddress Dirección de la cartera generada
     */
    function registerWithGeneratedWallet(string memory username, address generatedAddress) public usernameAvailable(username) {
        require(generatedAddress != address(0), "Direccion invalida");
        require(!users[generatedAddress].isRegistered, "Cartera ya registrada");
        
        _createUser(generatedAddress, username, true, msg.sender);
        emit WalletGenerated(generatedAddress, username);
    }

    /**
     * @dev Función interna para crear un usuario
     */
    function _createUser(
        address userAddress,
        string memory username,
        bool isGenerated,
        address linkedWallet
    ) internal {
        users[userAddress] = User({
            username: username,
            isRegistered: true,
            registrationDate: block.timestamp,
            isGeneratedWallet: isGenerated,
            linkedWallet: linkedWallet
        });

        usernameToAddress[username] = userAddress;
        registeredAddresses.push(userAddress);

        emit UserRegistered(userAddress, username, block.timestamp, isGenerated);
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
     * @dev Obtener detalles completos del usuario
     */
    function getUserDetails(address userAddress) public view returns (
        string memory username,
        uint256 registrationDate,
        bool isGeneratedWallet,
        address linkedWallet
    ) {
        require(users[userAddress].isRegistered, "Usuario no encontrado");
        User memory user = users[userAddress];
        return (
            user.username,
            user.registrationDate,
            user.isGeneratedWallet,
            user.linkedWallet
        );
    }

    /**
     * @dev Verificar si una dirección corresponde a una cartera generada
     */
    function isGeneratedWallet(address userAddress) public view returns (bool) {
        return users[userAddress].isGeneratedWallet;
    }
}