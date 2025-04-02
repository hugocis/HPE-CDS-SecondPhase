# Usar una imagen base de Node.js
FROM node:18

# Instalar dos2unix
RUN apt-get update && apt-get install -y dos2unix && rm -rf /var/lib/apt/lists/*

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de archivos
COPY . .

# Asegurar que el script tenga saltos de línea Unix y permisos de ejecución
RUN dos2unix docker-entrypoint.sh && \
    chmod +x docker-entrypoint.sh

# Compilar los contratos
RUN npx hardhat compile

# Exponer puertos necesarios
EXPOSE 5050
EXPOSE 8545

# Usar nuestro script de entrada personalizado
ENTRYPOINT ["./docker-entrypoint.sh"]