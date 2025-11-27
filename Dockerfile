FROM mcr.microsoft.com/playwright:v1.56.1-noble

WORKDIR /home/pwuser/app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/main.js"]
