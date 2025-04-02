# EcoToken Blockchain Application

Esta aplicación permite gestionar tokens EcoToken con funcionalidades de registro de usuarios y gestión de carteras.

## Requisitos
- Docker
- Docker Compose

## Inicio Rápido

1. Construir y ejecutar los contenedores:
```bash
docker-compose up -d --build
```

2. Acceder a la aplicación:
- Interfaz web: http://localhost:5050
- Nodo Hardhat: http://localhost:8545

## Configurar MetaMask

1. Abrir MetaMask
2. Añadir una nueva red con estos parámetros:
   - Network Name: Hardhat Local
   - RPC URL: http://localhost:8545
   - Chain ID: 31337
   - Currency Symbol: ETH

## Funcionalidades

- Registro de usuarios con dos opciones:
  - Usar cartera existente de MetaMask
  - Crear nueva cartera gestionada por el sistema
- Gestión de tokens:
  - Almacenar (mint) nuevos tokens
  - Quemar tokens
  - Transferir entre carteras
- Sistema de roles (owner, admin, usuario)
- Pausado de emergencia del contrato

## Comandos Útiles

### Ver logs de la aplicación
```bash
docker-compose logs -f blockchain-app
```

### Detener la aplicación
```bash
docker-compose down
```

### Reiniciar la aplicación
```bash
docker-compose restart
```

### Detener y eliminar volúmenes (reset completo)
```bash
docker-compose down -v
```

## Desarrollo

Los archivos están montados en volúmenes, por lo que los cambios en:
- Contratos (./contracts)
- Scripts (./scripts)
- Interfaz web (./public)
Se reflejarán en el contenedor sin necesidad de reconstruir.
