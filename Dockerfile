FROM node:12  AS builder

WORKDIR /app
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN npm install
RUN npm install -g @angular/cli@7.3.9
COPY . .
RUN ng build --prod
#RUN npm run ng build  --prod
FROM nginxinc/nginx-unprivileged
COPY nginx.conf /etc/nginx/conf.d/default.conf
#RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist/OrangeVoucher-frontend  /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
