# ---- Stage: development ----
FROM node:20-alpine AS development

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 4200

CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--allowed-hosts=all"]

# ---- Stage: production ----
FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx ng build --configuration production
