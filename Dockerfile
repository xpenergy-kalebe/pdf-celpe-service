# Dockerfile para Nest + Puppeteer na Render
FROM node:18-slim

# Instala dependências do Chromium
RUN apt-get update && apt-get install -y \
    chromium \
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
    xdg-utils \
    --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Cria diretório app
WORKDIR /app

# Copia arquivos
COPY . .

# Instala dependências
RUN npm install

# Builda app
RUN npm run build

# Expõe porta
EXPOSE 3000

# Start
CMD ["npm", "run", "start:prod"]
