FROM node:20.14.0-alpine AS build 

RUN npm install -g nodemon

WORKDIR /app

COPY package*.json ./
RUN npm install

RUN apk add --no-cache mongodb-tools

COPY . .

EXPOSE 4000

CMD ["npm", "start"]
