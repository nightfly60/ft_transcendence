#!/bin/sh
set -e

mkdir -p /etc/ssl/private /etc/ssl/certs

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/private-key.pem \
  -out    /etc/ssl/certs/selfsigned-cert.pem \
  -subj   "/CN=localhost"

chmod 644 /etc/ssl/private/private-key.pem
chmod 644 /etc/ssl/certs/selfsigned-cert.pem

exec nginx