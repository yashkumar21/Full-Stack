# Stage 1: build the Angular PWA
FROM node:20-slim AS frontend-build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY angular.json ngsw-config.json tsconfig*.json ./
COPY public ./public
COPY src ./src
RUN npm run build

# Stage 2: runtime — Express server + built frontend
FROM node:20-slim AS runtime
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev
COPY backend .
COPY --from=frontend-build /app/dist/a3/browser /app/dist/a3/browser

CMD ["node", "server.js"]
