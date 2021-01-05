FROM node:12  AS builder

WORKDIR /app
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN npm install
RUN npm install -g @angular/cli@7.3.9
COPY . .
#RUN ng build --prod
RUN npm run ng build  --prod
FROM  nginx:1.15.2-alpine
COPY --from=builder /app/dist/OrangeVoucher-frontend  /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
#CMD ["nginx", "-g", "daemon off;"]

