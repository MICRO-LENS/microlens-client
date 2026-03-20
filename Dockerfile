# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# K8s 배포 시 빈 문자열로 주입 → 상대 URL 사용 (Nginx Ingress와 같은 호스트)
# 로컬 개발 시 .env의 VITE_API_BASE_URL=http://localhost:8000 이 우선 적용됨
ARG VITE_API_BASE_URL=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# Serve stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
