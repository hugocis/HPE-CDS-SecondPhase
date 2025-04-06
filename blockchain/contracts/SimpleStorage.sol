// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SimpleStorage
 * @dev A contract to store, transfer, and burn values with role-based access control
 */
contract SimpleStorage {
    // State variables
    address public owner;
    bool public paused;
    mapping(address => uint256) private balances;
    mapping(address => bool) private administrators;

    // Events
    event ValueChanged(address indexed account, uint256 oldValue, uint256 newValue, uint256 addedValue);
    event ValueBurned(address indexed account, uint256 oldValue, uint256 newValue, uint256 burnedAmount);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event AdminAdded(address indexed account);
    event AdminRemoved(address indexed account);
    event ContractPaused(address indexed by);
    event ContractUnpaused(address indexed by);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Solo el owner puede realizar esta accion");
        _;
    }

    modifier onlyAdminOrOwner() {
        require(msg.sender == owner || administrators[msg.sender], "Solo administradores pueden realizar esta accion");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Contrato esta pausado");
        _;
    }

    // Constructor
    constructor() {
        owner = msg.sender;
        administrators[msg.sender] = true;
        emit AdminAdded(msg.sender);
    }

    // Administrative functions
    function addAdmin(address account) public onlyOwner {
        administrators[account] = true;
        emit AdminAdded(account);
    }

    function removeAdmin(address account) public onlyOwner {
        require(account != owner, "No puedes remover al owner como admin");
        administrators[account] = false;
        emit AdminRemoved(account);
    }

    function pause() public onlyOwner {
        paused = true;
        emit ContractPaused(msg.sender);
    }

    function unpause() public onlyOwner {
        paused = false;
        emit ContractUnpaused(msg.sender);
    }

    function isAdmin(address account) public view returns (bool) {
        return administrators[account];
    }

    // Main functions
    function store(uint256 value, address to) public onlyAdminOrOwner whenNotPaused {
        uint256 oldValue = balances[to];
        balances[to] += value;
        emit ValueChanged(to, oldValue, balances[to], value);
    }
    
    // Función original para auto-minteo (mantener compatibilidad)
    function store(uint256 value) public whenNotPaused {
        uint256 oldValue = balances[msg.sender];
        balances[msg.sender] += value;
        emit ValueChanged(msg.sender, oldValue, balances[msg.sender], value);
    }

    function burn(uint256 amount) public whenNotPaused {
        require(amount <= balances[msg.sender], "No puedes quemar mas del valor almacenado");
        uint256 oldValue = balances[msg.sender];
        balances[msg.sender] -= amount;
        emit ValueBurned(msg.sender, oldValue, balances[msg.sender], amount);
    }

    function transfer(address to, uint256 amount) public whenNotPaused {
        require(to != address(0), "No puedes transferir a la direccion cero");
        require(amount <= balances[msg.sender], "Balance insuficiente");
        
        balances[msg.sender] -= amount;
        balances[to] += amount;
        
        emit Transfer(msg.sender, to, amount);
    }

    function retrieve() public view returns (uint256) {
        return balances[msg.sender];
    }

    function balanceOf(address account) public view returns (uint256) {
        return balances[account];
    }
}