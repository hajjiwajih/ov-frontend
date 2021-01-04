FROM node:12  AS builder

WORKDIR /app
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN npm cache clean --force
RUN npm install
RUN npm install -g @angular/cli@9.1.7
COPY . .
RUN ng build --prod

FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=builder /app/dist/OrangeVoucher-frontend /usr/share/nginx/html/
CMD ["nginx", "-g", "daemon off;"]
EXPOSE 80

