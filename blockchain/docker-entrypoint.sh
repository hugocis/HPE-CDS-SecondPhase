#!/bin/sh

# Iniciar el nodo de Hardhat en segundo plano
echo "Iniciando nodo Hardhat..."
npx hardhat node --hostname 0.0.0.0 --network hardhat &

# Esperar a que el nodo esté listo
sleep 10

# Desplegar los contratos
echo "Desplegando contratos..."
npx hardhat run scripts/deploy.ts --network localhost
if [ $? -ne 0 ]; then
    echo "Error al desplegar SimpleStorage"
    exit 1
fi

npx hardhat run scripts/deploy-registry.ts --network localhost
if [ $? -ne 0 ]; then
    echo "Error al desplegar UserRegistry"
    exit 1
fi

# Verificar que el archivo de direcciones existe
if [ ! -f ./public/contract-addresses.json ]; then
    echo "Error: No se encontró el archivo de direcciones de contratos"
    exit 1
fi

# Iniciar la API REST en segundo plano
echo "Iniciando API REST..."
PORT=3001 node api.js &

# Esperar a que la API esté lista
sleep 5

# Iniciar el servidor web
echo "Iniciando servidor web..."
PORT=5050 node server.js