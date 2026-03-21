FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --production

COPY . .

RUN mkdir -p data

EXPOSE 4100

ENV PORT=4100

CMD ["node", "src/server.js"]
