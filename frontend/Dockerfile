FROM node:20.14.0-alpine AS build 

# Crear el directorio de la app en el contenedor
WORKDIR /app

COPY package.json .

COPY . .

RUN npm install
# empaquetamos el código de producción
RUN npm run build

EXPOSE 8080

CMD ["npm", "run", "dev"]

