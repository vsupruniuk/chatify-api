FROM node:22.4.1-slim

LABEL maintainer="vladsupruniuk@gmail.com"

WORKDIR app/

COPY package.json package.json
RUN npm install

COPY . .
