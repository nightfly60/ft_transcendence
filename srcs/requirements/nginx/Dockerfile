# nginx distribution alpine
FROM nginx:alpine

# installer OpenSSL dans le container
RUN apk add --no-cache openssl

# Certificats ssl (nginx => tls1.2)

#  Creer leurs repetoire de stockage dans le container
RUN mkdir -p /etc/ssl/private /etc/ssl/certs

#  Generer les deux clefs
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/private-key.pem \
    -out /etc/ssl/certs/selfsigned-cert.pem \
    -subj "/CN=localhost"

# Copier le build
COPY /browser /usr/share/nginx/html

# Copier la config nginx dans le container
COPY conf/nginx.conf /etc/nginx/nginx.conf

# Ouvrir le port 443
EXPOSE 443

# Run
CMD ["nginx"]
