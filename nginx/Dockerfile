FROM nginx:alpine AS development

RUN apk add --no-cache openssl

COPY ./conf/nginx_dev.conf /etc/nginx/nginx.conf
COPY ./entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

EXPOSE 443

ENTRYPOINT ["/entrypoint.sh"]

FROM nginx:alpine AS production

RUN apk add --no-cache openssl

COPY ./conf/nginx_prod.conf /etc/nginx/nginx.conf

COPY ./entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

EXPOSE 443

ENTRYPOINT ["/entrypoint.sh"]
