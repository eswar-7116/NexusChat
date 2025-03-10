FROM node:latest
WORKDIR /app

COPY backend/package*.json .
RUN npm install

COPY backend/ .
EXPOSE 5000

CMD [ "node", "server.js" ]