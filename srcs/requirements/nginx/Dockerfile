FROM node:24-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package-related files first to leverage Docker's caching mechanism
COPY angular/package.json angular/package-lock.json* ./

# Install project dependencies using npm ci (ensures a clean, reproducible install)
RUN --mount=type=cache,target=/root/.npm npm ci

# Copy the rest of the application source code into the container
COPY angular/. .

# Build the Angular application
RUN npm run build 

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
    -subj "/CN=chess42.fr"

# Copier la config nginx dans le container
COPY nginx/conf/nginx.conf /etc/nginx/nginx.conf

# Copier Angular dans Nginx
COPY --chown=nginx:nginx --from=builder /app/dist/*/browser /usr/share/nginx/html

# Ouvrir le port 443
EXPOSE 443

# Run
CMD ["nginx"]
