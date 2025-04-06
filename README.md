# EcoToken - Plataforma de Turismo Sostenible

## 🎥 Demo del Proyecto

[![Ver demo de EcoToken](https://github.com/hugocis/HPE-CDS-SecondPhase/blob/master/DEMO.png)](https://drive.google.com/file/d/1ROZjlSTtQHTC5BV8-Uh0SgzVis1bESbV/view?usp=sharing)

## 📋 Descripción General
EcoToken es una plataforma integral que combina blockchain, análisis de datos turísticos y una interfaz web moderna para promover el turismo sostenible. El proyecto está compuesto por tres componentes principales:

1. **Blockchain (Smart Contracts)**: Sistema de tokens y registro de usuarios
2. **Sistema de Procesamiento de Datos Turísticos**: Pipeline de datos con Kafka
3. **Aplicación Web**: Frontend moderno con Next.js

## 🏗️ Estructura del Proyecto

```
EcoToken/
├── blockchain/           # Componente blockchain y smart contracts
├── kafka-tourism-data/   # Sistema de procesamiento de datos turísticos
└── next/                # Aplicación web (frontend)
```

## 🚀 Requisitos Previos

- Docker y Docker Compose
- Node.js v18 o superior
- npm v9 o superior
- PostgreSQL
- MetaMask (para interactuar con la blockchain)

## 🛠️ Instalación y Configuración

### 1. Configuración de la Base de Datos

1. Asegúrate de tener PostgreSQL instalado y corriendo
2. Crea una base de datos para el proyecto
3. Configura las variables de entorno en los archivos `.env` correspondientes

### 2. Componente Blockchain

```bash
cd blockchain
npm install
# Si usas Docker:
docker-compose up -d
# Si desarrollo local:
npm run node
npm run deploy
```

### 3. Sistema de Datos Turísticos

```bash
cd kafka-tourism-data
docker-compose up -d
```

### 4. Aplicación Web

```bash
cd next
npm install
npm run dev
```

## 🔧 Configuración de MetaMask

1. Instala la extensión MetaMask
2. Añade la red local de desarrollo:
   - Network Name: Hardhat Local
   - RPC URL: http://localhost:8545
   - Chain ID: 31337
   - Currency Symbol: ECO

## 📊 Componentes del Sistema

### Blockchain (Puerto: 8545)
- Smart Contracts para gestión de tokens
- API REST para interacción con contratos
- Sistema de registro de usuarios

### Kafka Tourism Data (Puertos: 9092, 29092)
- Procesamiento de datos turísticos en tiempo real
- Análisis de sostenibilidad
- Pipeline de datos con Kafka Connect

### Next.js Frontend (Puerto: 3000)
- Interfaz de usuario moderna
- Sistema de autenticación
- Gestión de reservas y recompensas
- Dashboard de sostenibilidad

## 🌐 Endpoints Principales

- Frontend: http://localhost:3000
- API Blockchain: http://localhost:3001/api
- Kafka Connect: http://localhost:8083
- Schema Registry: http://localhost:8081

## 📝 Archivos de Configuración Importantes

- `blockchain/hardhat.config.ts`: Configuración de la red blockchain
- `kafka-tourism-data/docker-compose.yml`: Configuración del sistema Kafka
- `next/.env`: Variables de entorno para el frontend
- `next/prisma/schema.prisma`: Schema de la base de datos

## 🔍 Monitoreo y Logs

### Logs de Blockchain
```bash
docker-compose -f blockchain/docker-compose.yml logs -f
```

### Logs de Kafka
```bash
docker-compose -f kafka-tourism-data/docker-compose.yml logs -f
```

## 🚦 Estado de los Servicios

Para verificar el estado de todos los servicios:
```bash
docker-compose ps
```

## 🛑 Detener el Sistema

```bash
# Detener componente blockchain
cd blockchain && docker-compose down

# Detener sistema Kafka
cd kafka-tourism-data && docker-compose down

# Detener frontend (Ctrl+C en la terminal donde está corriendo)
```

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
