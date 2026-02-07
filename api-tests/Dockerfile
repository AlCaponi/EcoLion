FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci || npm install

COPY . .

CMD ["npm", "test"]
