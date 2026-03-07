FROM alpine:3.19

RUN apk update && apk add --no-cache mariadb mariadb-client

RUN mkdir -p /var/lib/mysql /run/mysqld \
    && chown -R mysql:mysql /var/lib/mysql /run/mysqld

RUN mkdir -p /app/src/server/public/avatars && chmod 777 /app/src/server/public/avatars

COPY conf/my.cnf /etc/my.cnf

COPY tools/transcendence.sh /etc/transcendence.sh

COPY tools/entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/entrypoint.sh
RUN chmod +x /etc/transcendence.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
