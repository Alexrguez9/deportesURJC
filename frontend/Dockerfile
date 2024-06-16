FROM node:18-alpine AS build 

# Crear el directorio de la app en el contenedor
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# empaquetamos el código de producción
RUN npm run build

EXPOSE 5173

CMD ["npm", "run", "dev"]

