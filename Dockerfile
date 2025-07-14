FROM node:20-slim

# 1. Instalar todas las dependencias que necesita Chromium
RUN apt-get update && apt-get install -y \
  wget \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
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
  apt-get clean && rm -rf /var/lib/apt/lists/*

# 2. Directorio de trabajo
WORKDIR /app

# 3. Copiar dependencias e instalar
COPY package*.json ./
RUN npm install

# 4. Instalar Chrome manualmente con Puppeteer >=22
RUN npx puppeteer browsers install chrome

# 5. Copiar el resto del código fuente
COPY . .

# 6. Definir ruta exacta del binario Chrome instalado
ENV PUPPETEER_EXECUTABLE_PATH=/root/.cache/puppeteer/chrome/linux-127.0.6533.88/chrome-linux64/chrome
ENV NODE_ENV=production

# 7. Permisos
RUN chmod -R 755 /app

# 8. Entrypoint por defecto
ENTRYPOINT ["npm", "run"]
