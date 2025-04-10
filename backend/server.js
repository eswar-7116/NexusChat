import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { app, server } from './helpers/socketio.js';
import connectDB from './db/db.js';
import authRoutes from './routes/authRoutes.js';
import checkAuth from './middleware/authMiddleware.js';
import messageRoutes from './routes/messageRoutes.js';

connectDB();  // Connect to the database

const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 5000;  // Default to 5000 if PORT is not defined in .env

// Middleware to parse requests with JSON payloads.
app.use(express.json({limit: '10mb'}));

// Middleware to parse requests with cookies.
app.use(cookieParser());

// Use CORS
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

// Middleware to log each request method and URL
app.use('/', (req, _, next) => {
    console.log(`${req.method} request to ${req.url}`);
    next();
});

// Auth routes
app.use('/auth', authRoutes);

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