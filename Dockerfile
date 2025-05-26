FROM node:24-slim
WORKDIR /app

# Copy root package files
COPY package*.json ./
# Copy backend and frontend package files
COPY backend/package*.json backend/
COPY frontend/package*.json frontend/

# Install all dependencies
RUN npm install

# Copy all source code
COPY . .

# Run build script
RUN npm run build

# Set NODE_ENV to production
ENV NODE_ENV=production

# Expose the port
EXPOSE 5000

# Run backend server
CMD ["npm", "run", "start"]
