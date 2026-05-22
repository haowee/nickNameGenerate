FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --registry=https://registry.npmjs.org

COPY . .

EXPOSE 3456

CMD ["node", "server.js"]
