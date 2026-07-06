FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache vips-dev

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3006

CMD ["npm", "start"]
