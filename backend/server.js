import express from 'express';
import { config as configDotenv } from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { app, server } from './helpers/socketio.js';
import connectDB from './db/db.js';
import signup from './routes/auth/signUp.js';
import verifyUserOtp from './routes/auth/verifyUserOtp.js';
import login from './routes/auth/login.js';
import logout from './routes/auth/logout.js';
import changePassword from './routes/auth/changePassword.js';
import editProfile from './routes/auth/editProfile.js';
import checkAuth from './middleware/authMiddleware.js';
import messageRoutes from './routes/messages/routes.js';

configDotenv();  // Load environment variables from .env
connectDB();     // Connect to the database

const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 5000;  // Default to 5000 if PORT is not defined in .env

// Middleware to parse requests with JSON payloads.
app.use(express.json({limit: '10mb'}));

// Middleware to parse requests with cookies.
app.use(cookieParser());

// Use CORS
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

// Middleware to log each request method and URL
app.use('/', (req, _, next) => {
    console.log(`${req.method} request to ${req.url}`);
    next();
});

// Auth routes
app.use('/auth', signup);
app.use('/auth', verifyUserOtp);
app.use('/auth', login);
app.use('/auth', checkAuth, logout);
app.use('/auth', checkAuth, changePassword);
app.use('/auth', checkAuth, editProfile);

// Route that checks if user is logged in
app.get('/check', checkAuth, (req, res) => {
    try {
        res.status(200).json({ success: true, user: req.user });
    } catch(error) {
        console.error('Error while checking user login:', error.message);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
});

// Message routes
app.use('/messaging', checkAuth, messageRoutes);

// Starting server
server.listen(port, host, () => {
    console.log(`Server started at http://${host}:${port}`);
});