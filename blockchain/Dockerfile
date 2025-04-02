# Usar una imagen base de Node.js
FROM node:18

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de archivos
COPY . .

# Dar permisos de ejecución al script de entrada
RUN chmod +x docker-entrypoint.sh

# Compilar los contratos
RUN npx hardhat compile

# Exponer puertos necesarios
EXPOSE 5050
EXPOSE 8545

# Usar nuestro script de entrada personalizado
ENTRYPOINT ["./docker-entrypoint.sh"]