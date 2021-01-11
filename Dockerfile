
FROM node:12  AS builder

WORKDIR /app
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN npm cache clean --force
RUN npm install
RUN npm install -g @angular/cli@7.3.9
COPY . .
RUN  npm run build

FROM nginxinc/nginx-unprivileged:1.16.1-alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist/OrangeVoucher-frontend /usr/share/nginx/html/
EXPOSE 8080
