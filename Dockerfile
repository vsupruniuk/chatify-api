FROM node:24.13.1-trixie-slim AS builder

WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.json ./
COPY tsconfig.build.json ./
COPY nest-cli.json ./

RUN npm ci \
    && npm i tar@7.5.7 @isaacs/brace-expansion@5.0.1

COPY src ./src

RUN npm run build

FROM node:24.13.1-trixie-slim AS runner

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/package-lock.json ./package-lock.json

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules

RUN groupadd -r app \
    && useradd -r -g app app \
    && chown -R app:app /usr/src/app
USER app

CMD ["npm", "run", "start:prod"]
