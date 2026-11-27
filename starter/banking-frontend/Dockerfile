# Mock e-banking frontend: static build served by nginx.
#   docker build -t trustroom-banking-frontend banking-frontend
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.29-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
# Writes config.js from API_URL and TRUSTROOM_URL at container start (run by the nginx entrypoint).
COPY docker-config.sh /docker-entrypoint.d/40-trustroom-config.sh
RUN chmod +x /docker-entrypoint.d/40-trustroom-config.sh
ENV API_URL=http://localhost:8000/api \
    TRUSTROOM_URL=""
EXPOSE 8090
