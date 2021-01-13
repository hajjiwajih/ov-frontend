FROM node:12  AS builder

WORKDIR /app
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN npm install
RUN npm install -g @angular/cli@7.3.9
COPY . .
RUN ng build --prod
#RUN npm run ng build  --prod
FROM  xmlking/openshift-nginx:1.13.9-alpine
COPY nginx.conf /etc/nginx/conf.d/nginx.conf.tmpl
#RUN rm -rf /usr/share/nginx/html/*
## Remove default nginx website, make default.conf writable by OpenShift's user
RUN set -x \
	&& rm -rf /usr/share/nginx/html/* \
	&& chmod go+w /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist/OrangeVoucher-frontend  /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
