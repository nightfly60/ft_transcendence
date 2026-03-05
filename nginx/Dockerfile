# ========================================
# Stage 1: Build Angular frontend
# ========================================
FROM node:alpine AS builder

WORKDIR /app

COPY angular/package*.json ./
RUN npm ci

COPY angular/ .
RUN npm run build -- --configuration=production

# ========================================
# Stage 2: nginx
# ========================================
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

# Copier le build Angular
COPY --from=builder /app/dist/angular/browser /usr/share/nginx/html

# Copier la config nginx dans le container
COPY nginx/conf/nginx.conf /etc/nginx/nginx.conf

# Ouvrir le port 443
EXPOSE 443

# Run
CMD ["nginx"]
