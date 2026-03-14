FROM nginx:alpine

RUN apk add --no-cache openssl

COPY ./conf/nginx.conf /etc/nginx/nginx.conf
COPY ./entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

EXPOSE 443

ENTRYPOINT ["/entrypoint.sh"]
