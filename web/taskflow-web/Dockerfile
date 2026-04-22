FROM node:22-alpine AS build
WORKDIR /app

COPY web/taskflow-web/package*.json ./
RUN npm ci

COPY web/taskflow-web/ .

ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

FROM nginx:1.27-alpine AS runtime
WORKDIR /usr/share/nginx/html

COPY web/taskflow-web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist ./

EXPOSE 80
