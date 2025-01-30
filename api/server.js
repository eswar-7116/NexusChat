import express from 'express';
import { config as configDotenv } from 'dotenv';
import cookieParser from 'cookie-parser';

import connectDB from './db/db.js';
import signupRoute from './routes/auth/signup.js';
import verifyUserOtp from './routes/auth/verifyUserOtp.js';
import login from './routes/auth/login.js';
import logout from './routes/auth/logout.js';
import checkAuth from './middleware/authMiddleware.js';

configDotenv();  // Load environment variables from .env
connectDB();     // Connect to the database

const app = express();

const host = process.env.HOST || '0.0.0.0';  // Default to 'localhost' if HOST is not defined in .env
const port = process.env.PORT || 5000;       // Default to 5000 if PORT is not defined in .env

// Middleware to parse requests with JSON payloads.
app.use(express.json());

// Middleware to parse requests with cookies.
app.use(cookieParser());

// Middleware to log each request method and URL
app.use('/', (req, _, next) => {
    console.log(`${req.method} request to ${req.url}`);
    next();
});

// Auth routes
app.use('/api/auth', signupRoute);
app.use('/api/auth', verifyUserOtp);
app.use('/api/auth', login);
app.use('/api/auth', logout);

// Message routes
app.post('/user', checkAuth, (req, res) => {
    return res.status(200).json({
        status: true,
        message: "Got access",
        user: req.user
    });
});

// Starting server
app.listen(port, host, () => {
    console.log(`Server started at http://${host}:${port}`);
});