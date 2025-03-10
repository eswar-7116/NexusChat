# NexusChat

A real-time chat application built with Express.js, Node.js, React, Socket.io, and MongoDB.

## Installation & Setup

### Prerequisites

- Node.js (v14.0.0 or later)
- npm or yarn
- MongoDB (local or Atlas)
- Git
- Cloudinary account
- Email account for notifications

### Environment Variables

Create a `.env` file in the backend directory with:

```
DB_URL=your_mongodb_connection_string
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_password
PORT=5000
HOST=localhost
JWT_SECRET=your_jwt_secret
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET=your_cloudinary_api_secret
```

### Option 1: Running Without Docker

1. **Clone the repository**:
   ```bash
   git clone https://github.com/eswar-7116/NexusChat.git
   cd NexusChat
   ```

2. **Create environment file**:
   Create a `.env` file in the project root with the environment variables listed above.

3. **Backend Setup**:
   ```bash
   cd backend
   npm install
   node server.js
   ```

4. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

5. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

### Option 2: Running With Docker

1. **Clone the repository**:
   ```bash
   git clone https://github.com/eswar-7116/NexusChat.git
   cd NexusChat
   ```

2. **Create environment file**:
   Create a `.env` file in the project root with the environment variables listed above.

3. **Build and run with Docker Compose**:
   ```bash
   docker-compose build
   docker-compose up
   ```

4. **Access the application**:
   - Application: http://localhost:5173