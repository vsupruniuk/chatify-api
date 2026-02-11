FROM node:24.13.0-alpine3.23 AS builder

WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.json ./
COPY tsconfig.build.json ./
COPY nest-cli.json ./

RUN npm ci --include=dev

COPY src ./src

RUN npm run build

FROM node:24.13.0-alpine3.23 AS runner

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/package-lock.json ./package-lock.json

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules

RUN addgroup -S app \
    && adduser -S -G app app \
    && chown -R app:app /usr/src/app

USER app

CMD ["npm", "run", "start:prod"]
