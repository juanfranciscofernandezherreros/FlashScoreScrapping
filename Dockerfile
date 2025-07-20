# syntax=docker/dockerfile:1
FROM node:20-slim

# 1) Actualizar npm a la versión 11.4.2
RUN npm install -g npm@11.4.2

# 2) Instalar Chromium y dependencias mínimas
RUN apt-get update && apt-get install -y \
    chromium \
    ca-certificates \
    fonts-liberation \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libxshmfence1 \
    libxext6 \
    libxfixes3 \
    libglib2.0-0 \
    libdrm2 \
    xdg-utils \
    unzip \
    --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*

# 3) Directorio de trabajo
WORKDIR /app

# 4) Copiar package.json e instalar dependencias
COPY package*.json ./
RUN npm install

# 5) Copiar el resto del código
COPY . .

# 6) Crear carpeta de salida y asignar permisos
RUN mkdir -p /app/src/csv \
 && chown -R node:node /app/src/csv \
 && chown -R node:node /app

# 7) Cambiar a usuario 'node' (no-root)
USER node

# 8) Variables de entorno
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    NODE_ENV=production

# 9) Entry point: tu script 'start' recibirá los args directamente
ENTRYPOINT ["npm","run","start"]
