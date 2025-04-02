# Ethereum Local Development Environment

Este proyecto demuestra una implementación básica de un contrato inteligente usando Hardhat.

## Configuración Inicial

1. Instalar las dependencias:
```bash
npm install
```

2. Compilar los contratos:
```bash
npx hardhat compile
```

## Iniciar la Red Local

Para iniciar la red local de desarrollo:
```bash
npx hardhat node
```

Este comando iniciará una red local de Ethereum en `http://127.0.0.1:8545`.

## Desplegar el Contrato

Para desplegar el contrato SimpleStorage en la red local:
```bash
npx hardhat run scripts/deploy.ts --network localhost
```

## Configurar MetaMask

1. Abrir MetaMask y hacer clic en el selector de red
2. Seleccionar "Agregar red"
3. Agregar una nueva red con los siguientes detalles:
   - Nombre de la red: Hardhat Local
   - Nueva URL de RPC: http://127.0.0.1:8545
   - ID de cadena: 31337
   - Símbolo de moneda: ETH

### Cuentas de Desarrollo

La red local de Hardhat viene con varias cuentas preconfiguradas con 10000 ETH cada una. Puedes importar estas cuentas a MetaMask usando las claves privadas que se muestran al iniciar el nodo de Hardhat.

## Interactuar con el Contrato

El contrato SimpleStorage tiene dos funciones principales:
- `store(uint256)`: Almacena un valor nuevo
- `retrieve()`: Recupera el valor almacenado

Puedes interactuar con el contrato a través de MetaMask una vez desplegado.

## Testing

Para ejecutar las pruebas:
```bash
npx hardhat test
```

## Estructura del Proyecto

```
├── contracts/
│   └── SimpleStorage.sol    # Contrato principal
├── scripts/
│   └── deploy.ts           # Script de despliegue
├── test/
│   └── SimpleStorage.ts    # Tests del contrato
└── hardhat.config.ts       # Configuración de Hardhat
```
