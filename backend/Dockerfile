FROM node:22-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ curl \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm ci || npm install

COPY . .

RUN mkdir -p /app/data

EXPOSE 8080

CMD ["npm", "start"]
