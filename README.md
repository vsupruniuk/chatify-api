# Chatify API

![Docker Image Size](https://img.shields.io/docker/image-size/vsupruniuk/chatify-api)
![Docker Image Version](https://img.shields.io/docker/v/vsupruniuk/chatify-api)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=vsupruniuk_chatify-api&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=vsupruniuk_chatify-api)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=vsupruniuk_chatify-api&metric=bugs)](https://sonarcloud.io/summary/new_code?id=vsupruniuk_chatify-api)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=vsupruniuk_chatify-api&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=vsupruniuk_chatify-api)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=vsupruniuk_chatify-api&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=vsupruniuk_chatify-api)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=vsupruniuk_chatify-api&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=vsupruniuk_chatify-api)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=vsupruniuk_chatify-api&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=vsupruniuk_chatify-api)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=vsupruniuk_chatify-api&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=vsupruniuk_chatify-api)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=vsupruniuk_chatify-api&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=vsupruniuk_chatify-api)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=vsupruniuk_chatify-api&metric=coverage)](https://sonarcloud.io/summary/new_code?id=vsupruniuk_chatify-api)

## Overview
Chatify API is a REST API for chatting application with real-time features built with NestJS as the core technology. <br />
Project using a PostgreSQL as a database providing high data-consistency, with TypeORM for safe and efficient manipulations with DB, <br />
and WebSockets for bidirectional and real-time user experience.

## Features
- Authorization: custom authorization build with JWT access and refresh tokens.
- User profile: view users public information or update personal public data.
- Direct chats: private chats between two users with secure message encryption and decryption.

## Technologies Stack
- NestJS: A progressive Node.js framework for efficient and scalable server-side apps.
- PostgreSQL: Powerful, open-source relational database for high data consistency and scalability.
- TypeORM: ORM for TypeScript that supports multiple databases and provides flexible and safe interactions with DB.
- WebSockets: Provides bidirectional communication channels between server and client and allows to implement real-time features.
- Docker: Containerization technology for software that allows to run the same project everywhere with the same result.

## Running the app
Pre-requirements - create a `.env` file with configured variables

### NPM
```shell
    npm install
    
    # dev
    npm run start:dev
    
    # prod
    npm run start:prod
```

### Docker
```shell
    # build from local Dockerfile (only API)
    docker build -t <image-name>:<tag> .
    docker run -d --env-file <path-to-env-file> --name <container-name> <image-name>:<tag>
    
    # build from docker-compose (API and database)
    docker-compose up --build -d
    
    # or use Makefile
    make up 
```

@nestjs/config
@nestjs/serve-static
cross-env
source-map-support
ts-loader





