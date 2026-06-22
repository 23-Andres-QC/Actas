FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --fetch-timeout=300000
COPY . .

FROM base AS build
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/infrastructure/db/migrations ./dist/infrastructure/db/migrations
EXPOSE 4000
CMD ["node", "dist/main.js"]
