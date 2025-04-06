const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Cargar contratos compilados
const SimpleStorageJson = require('./artifacts/contracts/SimpleStorage.sol/SimpleStorage.json');
const UserRegistryJson = require('./artifacts/contracts/UserRegistry.sol/UserRegistry.json');

const app = express();
const PORT = process.env.PORT || 3001;  // Puerto para la API

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de conexión a la blockchain
let provider;
let simpleStorageContract;
let userRegistryContract;
let adminWallet;

// Direcciones de los contratos desplegados (se establecerán después del despliegue)
let SIMPLE_STORAGE_ADDRESS = process.env.SIMPLE_STORAGE_ADDRESS || '';
let USER_REGISTRY_ADDRESS = process.env.USER_REGISTRY_ADDRESS || '';

// Clave privada del administrador (¡Ten cuidado con esto en producción!)
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY || '';

// Modificar la función initBlockchainConnection
const initBlockchainConnection = async () => {
  try {
    // Leer las direcciones de los contratos desde el archivo
    const addressesPath = path.join(__dirname, 'public', 'contract-addresses.json');
    if (!fs.existsSync(addressesPath)) {
      throw new Error('No se encontró el archivo de direcciones de contratos');
    }

    const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
    SIMPLE_STORAGE_ADDRESS = addresses.simpleStorage;
    USER_REGISTRY_ADDRESS = addresses.userRegistry;

    if (!SIMPLE_STORAGE_ADDRESS || !USER_REGISTRY_ADDRESS) {
      throw new Error('Direcciones de contratos no encontradas en el archivo');
    }

    // Usar el nodo de Hardhat local o un nodo especificado por variable de entorno
    const rpcUrl = process.env.RPC_URL || 'http://127.0.0.1:8545';
    provider = new ethers.JsonRpcProvider(rpcUrl);

    // Esperar a que el provider esté listo
    await provider.ready;

    // Crear instancias de los contratos
    simpleStorageContract = new ethers.Contract(
      SIMPLE_STORAGE_ADDRESS,
      SimpleStorageJson.abi,
      provider
    );

    userRegistryContract = new ethers.Contract(
      USER_REGISTRY_ADDRESS,
      UserRegistryJson.abi,
      provider
    );

    // Verificar que los contratos están desplegados
    const simpleStorageCode = await provider.getCode(SIMPLE_STORAGE_ADDRESS);
    const userRegistryCode = await provider.getCode(USER_REGISTRY_ADDRESS);

    if (simpleStorageCode === '0x' || userRegistryCode === '0x') {
      throw new Error('Los contratos no están desplegados correctamente');
    }

    console.log(`SimpleStorage contrato conectado en: ${SIMPLE_STORAGE_ADDRESS}`);
    console.log(`UserRegistry contrato conectado en: ${USER_REGISTRY_ADDRESS}`);

    // Configurar wallet de administrador si la clave está disponible
    if (ADMIN_PRIVATE_KEY) {
      adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
      console.log(`Wallet de administrador configurada: ${adminWallet.address}`);
    }

    return true;
  } catch (error) {
    console.error('Error al inicializar la conexión blockchain:', error);
    return false;
  }
};

// Función para guardar direcciones de contratos desplegados
const saveContractAddresses = (simpleStorageAddr, userRegistryAddr) => {
  SIMPLE_STORAGE_ADDRESS = simpleStorageAddr;
  USER_REGISTRY_ADDRESS = userRegistryAddr;

  // Reinicializar la conexión con las nuevas direcciones
  initBlockchainConnection();
};

// Endpoints API

// Health check
app.get('/api/health', (req, res) => {
  const isConnected = provider !== undefined;
  res.json({
    status: 'ok',
    blockchain: {
      connected: isConnected,
      simpleStorageAddress: SIMPLE_STORAGE_ADDRESS || null,
      userRegistryAddress: USER_REGISTRY_ADDRESS || null
    }
  });
});

// ENDPOINTS PARA TOKENS (SimpleStorage)

// Obtener balance de un usuario
app.get('/api/tokens/balance/:address', async (req, res) => {
  try {
    if (!simpleStorageContract) {
      return res.status(500).json({ error: 'Contrato SimpleStorage no inicializado' });
    }

    const { address } = req.params;
    const balance = await simpleStorageContract.balanceOf(address);
    
    res.json({
      address,
      balance: balance.toString()
    });
  } catch (error) {
    console.error('Error al obtener balance:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mintear tokens (store)
app.post('/api/tokens/mint', async (req, res) => {
  try {
    if (!simpleStorageContract || !adminWallet) {
      return res.status(500).json({ error: 'Contrato SimpleStorage o wallet de admin no inicializado' });
    }

    const { address, amount } = req.body;
    
    if (!address || !amount) {
      return res.status(400).json({ error: 'Se requiere dirección y cantidad' });
    }

    // Conectar el contrato con la wallet de admin
    const contractWithSigner = simpleStorageContract.connect(adminWallet);
    
    // Obtener el nonce actual
    const nonce = await provider.getTransactionCount(adminWallet.address);
    
    try {
      // Mintear tokens directamente a la dirección especificada usando la nueva función
      const tx = await contractWithSigner.store(amount, address, {
        nonce: nonce,
        gasLimit: 200000 // Asegurar suficiente gas
      });
      
      await tx.wait();
      
      // Verificar el nuevo balance
      const newBalance = await simpleStorageContract.balanceOf(address);
      
      res.json({
        success: true,
        transactionHash: tx.hash,
        amount,
        address,
        newBalance: newBalance.toString()
      });
    } catch (txError) {
      console.error('Error en la transacción:', txError);
      
      // Si hay un error con el nonce, intentar recuperar
      if (txError.code === 'NONCE_EXPIRED' || txError.message?.includes('nonce')) {
        // Esperar un momento para que la red se sincronice
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Reintentar con un nuevo nonce
        const newNonce = await provider.getTransactionCount(adminWallet.address);
        const tx = await contractWithSigner.store(amount, address, {
          nonce: newNonce,
          gasLimit: 200000
        });
        
        await tx.wait();
        
        // Verificar el nuevo balance después del reintento
        const newBalance = await simpleStorageContract.balanceOf(address);
        
        res.json({
          success: true,
          transactionHash: tx.hash,
          amount,
          address,
          newBalance: newBalance.toString(),
          recovered: true
        });
      } else {
        throw txError;
      }
    }
  } catch (error) {
    console.error('Error al mintear tokens:', error);
    res.status(500).json({ 
      error: error.message,
      code: error.code,
      details: error.info?.error?.message || error.shortMessage
    });
  }
});

// Transferir tokens
app.post('/api/tokens/transfer', async (req, res) => {
  try {
    if (!simpleStorageContract) {
      return res.status(500).json({ error: 'Contrato SimpleStorage no inicializado' });
    }

    const { from, to, amount, privateKey } = req.body;
    
    if (!from || !to || !amount || !privateKey) {
      return res.status(400).json({ error: 'Se requieren los parámetros: from, to, amount y privateKey' });
    }

    // Crear wallet con la clave privada proporcionada
    const userWallet = new ethers.Wallet(privateKey, provider);
    
    // Verificar que la dirección coincide
    if (userWallet.address.toLowerCase() !== from.toLowerCase()) {
      return res.status(400).json({ error: 'La clave privada no corresponde a la dirección "from"' });
    }
    
    // Conectar el contrato con la wallet del usuario
    const contractWithSigner = simpleStorageContract.connect(userWallet);
    
    // Realizar la transferencia
    const tx = await contractWithSigner.transfer(to, amount);
    const receipt = await tx.wait();
    
    res.json({
      success: true,
      transactionHash: tx.hash,
      from,
      to,
      amount
    });
  } catch (error) {
    console.error('Error al transferir tokens:', error);
    res.status(500).json({ error: error.message });
  }
});

// Quemar tokens
app.post('/api/tokens/burn', async (req, res) => {
  try {
    if (!simpleStorageContract) {
      return res.status(500).json({ error: 'Contrato SimpleStorage no inicializado' });
    }

    const { address, amount, privateKey } = req.body;
    
    if (!address || !amount || !privateKey) {
      return res.status(400).json({ error: 'Se requieren los parámetros: address, amount y privateKey' });
    }

    // Crear wallet con la clave privada proporcionada
    const userWallet = new ethers.Wallet(privateKey, provider);
    
    // Verificar que la dirección coincide
    if (userWallet.address.toLowerCase() !== address.toLowerCase()) {
      return res.status(400).json({ error: 'La clave privada no corresponde a la dirección proporcionada' });
    }
    
    // Conectar el contrato con la wallet del usuario
    const contractWithSigner = simpleStorageContract.connect(userWallet);
    
    // Quemar tokens
    const tx = await contractWithSigner.burn(amount);
    const receipt = await tx.wait();
    
    res.json({
      success: true,
      transactionHash: tx.hash,
      address,
      amount
    });
  } catch (error) {
    console.error('Error al quemar tokens:', error);
    res.status(500).json({ error: error.message });
  }
});

// ENDPOINTS PARA USUARIOS (UserRegistry)

// Crear cartera para usuario
app.post('/api/users/create-wallet', async (req, res) => {
  try {
    if (!userRegistryContract || !adminWallet) {
      return res.status(500).json({ error: 'Contrato UserRegistry o wallet de admin no inicializado' });
    }

    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Se requiere nombre de usuario' });
    }

    // Generar nueva wallet
    const wallet = ethers.Wallet.createRandom();
    
    // Conectar el contrato con la wallet de admin
    const contractWithSigner = userRegistryContract.connect(adminWallet);
    
    // Registrar la wallet en el contrato
    const tx = await contractWithSigner.registerWithGeneratedWallet(username, wallet.address);
    const receipt = await tx.wait();
    
    res.json({
      success: true,
      transactionHash: tx.hash,
      username,
      address: wallet.address,
      privateKey: wallet.privateKey // NOTA: En producción, esto debe manejarse de manera segura
    });
  } catch (error) {
    console.error('Error al crear cartera:', error);
    res.status(500).json({ error: error.message });
  }
});

// Registrar usuario con cartera existente
app.post('/api/users/register', async (req, res) => {
  try {
    if (!userRegistryContract) {
      return res.status(500).json({ error: 'Contrato UserRegistry no inicializado' });
    }

    const { username, privateKey } = req.body;
    
    if (!username || !privateKey) {
      return res.status(400).json({ error: 'Se requieren nombre de usuario y clave privada' });
    }

    // Crear wallet con la clave privada proporcionada
    const userWallet = new ethers.Wallet(privateKey, provider);
    
    // Conectar el contrato con la wallet del usuario
    const contractWithSigner = userRegistryContract.connect(userWallet);
    
    // Registrar el usuario
    const tx = await contractWithSigner.registerWithExistingWallet(username);
    const receipt = await tx.wait();
    
    res.json({
      success: true,
      transactionHash: tx.hash,
      username,
      address: userWallet.address
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener detalles de usuario
app.get('/api/users/:address', async (req, res) => {
  try {
    if (!userRegistryContract) {
      return res.status(500).json({ error: 'Contrato UserRegistry no inicializado' });
    }

    const { address } = req.params;
    
    // Verificar si el usuario está registrado
    const isRegistered = await userRegistryContract.isRegistered(address);
    
    if (!isRegistered) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    // Obtener detalles del usuario
    const userDetails = await userRegistryContract.getUserDetails(address);
    
    res.json({
      address,
      username: userDetails[0],
      registrationDate: new Date(userDetails[1] * 1000).toISOString(),
      isGeneratedWallet: userDetails[2],
      linkedWallet: userDetails[3]
    });
  } catch (error) {
    console.error('Error al obtener detalles de usuario:', error);
    res.status(500).json({ error: error.message });
  }
});

// Actualizar nombre de usuario
app.put('/api/users/update-username', async (req, res) => {
  try {
    if (!userRegistryContract) {
      return res.status(500).json({ error: 'Contrato UserRegistry no inicializado' });
    }

    const { address, newUsername, privateKey } = req.body;
    
    if (!address || !newUsername || !privateKey) {
      return res.status(400).json({ error: 'Se requieren dirección, nuevo nombre de usuario y clave privada' });
    }

    // Crear wallet con la clave privada proporcionada
    const userWallet = new ethers.Wallet(privateKey, provider);
    
    // Verificar que la dirección coincide
    if (userWallet.address.toLowerCase() !== address.toLowerCase()) {
      return res.status(400).json({ error: 'La clave privada no corresponde a la dirección proporcionada' });
    }
    
    // Conectar el contrato con la wallet del usuario
    const contractWithSigner = userRegistryContract.connect(userWallet);
    
    // Actualizar nombre de usuario
    const tx = await contractWithSigner.updateUsername(newUsername);
    const receipt = await tx.wait();
    
    res.json({
      success: true,
      transactionHash: tx.hash,
      address,
      newUsername
    });
  } catch (error) {
    console.error('Error al actualizar nombre de usuario:', error);
    res.status(500).json({ error: error.message });
  }
});

// Modificar la inicialización del servidor
app.listen(PORT, async () => {
  console.log(`API Server running on port ${PORT}`);
  
  // Intentar conectar a la blockchain con reintentos
  let retries = 3;
  let connected = false;
  
  while (retries > 0 && !connected) {
    console.log(`Intentando conectar a la blockchain (intentos restantes: ${retries})...`);
    connected = await initBlockchainConnection();
    if (!connected) {
      retries--;
      await new Promise(resolve => setTimeout(resolve, 5000)); // Esperar 5 segundos entre intentos
    }
  }
  
  if (connected) {
    console.log('Conexión a blockchain inicializada con éxito');
  } else {
    console.error('No se pudo inicializar la conexión a blockchain después de varios intentos');
    process.exit(1);
  }
});

// Exportar para uso en otros scripts
module.exports = {
  app,
  saveContractAddresses
};