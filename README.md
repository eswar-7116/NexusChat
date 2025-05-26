# NexusChat

A real-time chat application built with Express.js, Node.js, React, Socket.io, and MongoDB.

## Installation & Setup

### Prerequisites

- Node.js
- npm
- MongoDB (local or Atlas)
- Git
- Cloudinary account
- Email account for notifications

### Environment Variables

1. Create a `.env` file in the backend directory with:

   ```
   DB_URL=your_mongodb_connection_string
   EMAIL_USER=your_email_address
   EMAIL_PASS=your_email_app_password
   FRONTEND_URL=the_frontend_url
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_SECRET=your_cloudinary_api_secret
   ```

2. Create a `.env` file in the frontend directory with:

   ```
   VITE_BACKEND_URL=the_backend_url
   ```

### Option 1: Running Without Docker

1. **Clone the repository**:

   ```bash
   git clone https://github.com/eswar-7116/NexusChat.git
   cd NexusChat
   ```

2. **Create environment file**:
   Create a `.env` file in the project's backend and frontend directories with the environment variables listed above.

3. **Install dependencies and build the project**:

   ```bash
   npm run setup
   ```

4. **Start the server**:

   ```bash
   npm run dev
   ```

5. **Access the application**:
   - Frontend: http://localhost:5173

### Option 2: Running With Docker

1. **Clone the repository**:

   ```bash
   git clone https://github.com/eswar-7116/NexusChat.git
   cd NexusChat
   ```

2. **Create environment file**:
   Create a `.env` file in the project's backend and frontend directories with the environment variables listed above.

3. **Build and run with Docker**:

   ```bash
   docker build -t nexuschat .
   docker run -p 10000:10000 --env-file ./backend/.env nexuschat
   ```

4. **Access the application**:
   - Application: http://localhost:10000
