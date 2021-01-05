FROM node:12  AS builder

WORKDIR /app
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN npm install
RUN npm install -g @angular/cli@7.3.9
COPY . .
RUN ng build --prod

FROM  nginx:1.17.1-alpine
COPY nginx.conf  /etc/nginx/conf.d
COPY --from=builder /app/dist/OrangeVoucher-frontend  /usr/share/nginx/html
EXPOSE 80
#CMD ["nginx", "-g", "daemon off;"]

