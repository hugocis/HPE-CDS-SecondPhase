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

    // Custom errors
    error OnlyOwnerAllowed();
    error OnlyAdminOrOwnerAllowed();
    error ContractIsPaused();
    error InsufficientBalance(uint256 requested, uint256 available);
    error InvalidAmount();
    error InvalidAddress();
    error CannotRemoveOwnerAsAdmin();

    // Modifiers
    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwnerAllowed();
        _;
    }

    modifier onlyAdminOrOwner() {
        if (msg.sender != owner && !administrators[msg.sender]) revert OnlyAdminOrOwnerAllowed();
        _;
    }

    modifier whenNotPaused() {
        if (paused) revert ContractIsPaused();
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
        if (account == address(0)) revert InvalidAddress();
        administrators[account] = true;
        emit AdminAdded(account);
    }

    function removeAdmin(address account) public onlyOwner {
        if (account == owner) revert CannotRemoveOwnerAsAdmin();
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
        if (value == 0) revert InvalidAmount();
        if (to == address(0)) revert InvalidAddress();
        
        uint256 oldValue = balances[to];
        balances[to] += value;
        emit ValueChanged(to, oldValue, balances[to], value);
    }
    
    // Función original para auto-minteo (mantener compatibilidad)
    function store(uint256 value) public whenNotPaused {
        if (value == 0) revert InvalidAmount();
        
        uint256 oldValue = balances[msg.sender];
        balances[msg.sender] += value;
        emit ValueChanged(msg.sender, oldValue, balances[msg.sender], value);
    }

    function burn(uint256 amount) public whenNotPaused {
        if (amount == 0) revert InvalidAmount();
        if (amount > balances[msg.sender]) revert InsufficientBalance(amount, balances[msg.sender]);
        
        uint256 oldValue = balances[msg.sender];
        balances[msg.sender] -= amount;
        emit ValueBurned(msg.sender, oldValue, balances[msg.sender], amount);
    }

    function transfer(address to, uint256 amount) public whenNotPaused {
        if (to == address(0)) revert InvalidAddress();
        if (amount == 0) revert InvalidAmount();
        if (amount > balances[msg.sender]) revert InsufficientBalance(amount, balances[msg.sender]);
        
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