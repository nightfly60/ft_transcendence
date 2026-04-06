#!/bin/sh
set -e

mkdir -p /etc/ssl/private /etc/ssl/certs

if [ ! -f /etc/ssl/private/private-key.pem ] || [ ! -f /etc/ssl/certs/selfsigned-cert.pem ]; then
	openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
		-keyout /etc/ssl/private/private-key.pem \
		-out    /etc/ssl/certs/selfsigned-cert.pem \
		-subj   "/CN=localhost"
fi

chmod 644 /etc/ssl/private/private-key.pem
chmod 644 /etc/ssl/certs/selfsigned-cert.pem

envsubst '${NGINX_PORT}${APP_PORT}${ANGULAR_PORT}' < /etc/nginx/nginx.conf > /tmp/nginx.conf && mv /tmp/nginx.conf /etc/nginx/nginx.conf

exec nginx
