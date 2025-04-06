# EcoToken Blockchain Application

Esta aplicación implementa un sistema de tokens ecológicos (EcoToken) en la blockchain, permitiendo la gestión de tokens y usuarios con un enfoque en la sostenibilidad y transparencia.

## Descripción

EcoToken es una plataforma blockchain que permite:
- Crear y gestionar tokens ecológicos
- Sistema de registro de usuarios flexible
- Gestión de carteras segura
- Control de roles y permisos
- Transparencia en todas las operaciones

## Requisitos
- Docker y Docker Compose
  O
- Node.js v18 o superior
- npm v9 o superior

## Inicio Rápido

### Usando Docker

1. Construir y ejecutar los contenedores:
```bash
docker-compose up -d --build
```

2. Acceder a la aplicación:
- Interfaz web: http://localhost:5051
- Nodo Hardhat: http://localhost:8545

### Desarrollo Local

1. Instalar dependencias:
```bash
npm install
```

2. Iniciar el nodo Hardhat:
```bash
npm run node
```

3. En otra terminal, desplegar los contratos:
```bash
npm run deploy
```

4. Iniciar el servidor web:
```bash
npm start
```

## Configurar MetaMask

1. Abrir MetaMask
2. Añadir una nueva red con estos parámetros:
   - Network Name: Hardhat Local
   - RPC URL: http://localhost:8545
   - Chain ID: 31337
   - Currency Symbol: ETH

## Funcionalidades

### Registro de Usuarios
- **Opción MetaMask**: Usa tu cartera existente
- **Nueva Cartera**: El sistema genera una cartera segura
  - Guarda la clave privada de forma segura
  - Descarga el archivo JSON de respaldo

### Gestión de Tokens
- **Mintear (Crear)**: 
  - Ingresa la cantidad deseada
  - Confirma la transacción en MetaMask
  - Verifica el nuevo balance
- **Quemar**:
  - No puedes quemar más tokens de los que tienes
  - Confirma la transacción
  - El balance se actualiza automáticamente
- **Transferir**:
  - Especifica la dirección destino
  - Ingresa el monto a transferir
  - Confirma la operación

### Sistema de Roles
- **Owner**: Control total del sistema
- **Admin**: Gestión de usuarios y algunas operaciones especiales
- **Usuario**: Operaciones básicas con tokens

### Seguridad
- Pausado de emergencia del contrato
- Validación de transacciones
- Respaldo de carteras generadas
- Sistema de permisos por roles

## Solución de Problemas Comunes

### Mensajes de Error
- Los pop-ups de confirmación son normales y parte del sistema de seguridad
- Si la transacción es exitosa pero ves un mensaje de error, el token probablemente se procesó correctamente
- Verifica tu balance después de cada operación

### Problemas de Conexión
1. Asegúrate de que MetaMask está conectado a la red correcta
2. Verifica que el nodo Hardhat esté funcionando
3. Intenta reconectar la wallet si hay problemas

### Errores Comunes
- "Cannot burn more than stored value": No tienes suficientes tokens
- Errores de gas: Asegúrate de tener ETH en la red local
- Problemas de permisos: Verifica tu rol en el sistema

## Arquitectura

### Contratos
- `SimpleStorage.sol`: Gestión de tokens y permisos
- `UserRegistry.sol`: Registro y gestión de usuarios

### Frontend
- Interfaz web simple y funcional
- Conexión directa con MetaMask
- Actualizaciones en tiempo real

## Comandos Útiles

### Logs y Monitoreo
```bash
docker-compose logs -f blockchain-app
```

### Gestión de la Aplicación
```bash
# Detener
docker-compose down

# Reiniciar
docker-compose restart

# Reset completo
docker-compose down -v
```

## Desarrollo y Pruebas

Los archivos están montados en volúmenes para desarrollo activo:
- `./contracts`: Contratos inteligentes
- `./scripts`: Scripts de despliegue
- `./public`: Interfaz web
- `./test`: Pruebas automatizadas

### Ejecutar Pruebas
```bash
npm test
```

### Flujo de Desarrollo
1. Modifica los contratos o la interfaz
2. Las pruebas se ejecutan automáticamente
3. Los cambios se reflejan sin necesidad de reconstruir

## API REST Documentation

### Base Configuration
- Base URL: `http://localhost:3001/api`
- Response Format: JSON
- CORS: Enabled

### Endpoints

#### Health Check
```http
GET /api/health
```
Response:
```json
{
    "status": "ok",
    "blockchain": {
        "connected": boolean,
        "simpleStorageAddress": string | null,
        "userRegistryAddress": string | null
    }
}
```

#### Token Management

1. **Get Token Balance**
```http
GET /api/tokens/balance/:address
```
Response:
```json
{
    "address": string,
    "balance": string
}
```

2. **Mint Tokens**
```http
POST /api/tokens/mint
```
Request Body:
```json
{
    "address": string,
    "amount": number
}
```
Response:
```json
{
    "success": boolean,
    "transactionHash": string,
    "amount": number,
    "address": string
}
```

3. **Transfer Tokens**
```http
POST /api/tokens/transfer
```
Request Body:
```json
{
    "from": string,
    "to": string,
    "amount": number,
    "privateKey": string
}
```
Response:
```json
{
    "success": boolean,
    "transactionHash": string,
    "from": string,
    "to": string,
    "amount": number
}
```

4. **Burn Tokens**
```http
POST /api/tokens/burn
```
Request Body:
```json
{
    "address": string,
    "amount": number,
    "privateKey": string
}
```
Response:
```json
{
    "success": boolean,
    "transactionHash": string,
    "address": string,
    "amount": number
}
```

#### User Management

1. **Create New Wallet**
```http
POST /api/users/create-wallet
```
Request Body:
```json
{
    "username": string
}
```
Response:
```json
{
    "success": boolean,
    "transactionHash": string,
    "username": string,
    "address": string,
    "privateKey": string
}
```

2. **Register User with Existing Wallet**
```http
POST /api/users/register
```
Request Body:
```json
{
    "username": string,
    "privateKey": string
}
```
Response:
```json
{
    "success": boolean,
    "transactionHash": string,
    "username": string,
    "address": string
}
```

3. **Get User Details**
```http
GET /api/users/:address
```
Response:
```json
{
    "address": string,
    "username": string,
    "registrationDate": string,
    "isGeneratedWallet": boolean,
    "linkedWallet": string
}
```

4. **Update Username**
```http
PUT /api/users/update-username
```
Request Body:
```json
{
    "address": string,
    "newUsername": string,
    "privateKey": string
}
```
Response:
```json
{
    "success": boolean,
    "transactionHash": string,
    "address": string,
    "newUsername": string
}
```

### Error Handling
All endpoints use consistent error format:
```json
{
    "error": string
}
```

HTTP Status Codes:
- 200: Success
- 400: Client Request Error
- 404: Resource Not Found
- 500: Server Error

### Important Notes
1. All state-modifying transactions (mint, burn, transfer) require blockchain confirmation
2. Private keys should be handled securely
3. Balances and amounts are returned as strings for precision
4. Requires Hardhat node running on port 8545
5. Contracts must be deployed and addresses saved in contract-addresses.json

## Contribuir

1. Fork el repositorio
2. Crea una rama para tu feature
3. Ejecuta las pruebas
4. Envía un pull request
