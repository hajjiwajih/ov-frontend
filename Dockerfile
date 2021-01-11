FROM node:12  AS builder

WORKDIR /app
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN npm install
RUN npm install -g @angular/cli@7.3.9
COPY . .
RUN ng build --prod
#RUN npm run ng build  --prod
FROM bitnami/nginx
COPY nginx.conf /opt/bitnami/nginx/conf/server_blocks/
#RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist/OrangeVoucher-frontend  /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]



