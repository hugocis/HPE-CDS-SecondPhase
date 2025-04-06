#!/bin/sh

# Iniciar el nodo de Hardhat en segundo plano
npx hardhat node --hostname 0.0.0.0 --network hardhat &

# Esperar a que el nodo esté listo
sleep 10

# Desplegar los contratos
echo "Desplegando contratos..."
npx hardhat run scripts/deploy.ts --network localhost
npx hardhat run scripts/deploy-registry.ts --network localhost

# Iniciar la API REST en segundo plano
echo "Iniciando API REST..."
node api.js &

# Iniciar el servidor web
echo "Iniciando servidor web..."
node server.js