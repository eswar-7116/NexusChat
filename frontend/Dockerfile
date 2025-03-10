FROM node:latest
WORKDIR /app

COPY frontend/package*.json .
RUN npm install

COPY frontend/ .
EXPOSE 5173

CMD [ "npm", "run", "host" ]