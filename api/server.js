import express from 'express';
import { config as configDotenv } from 'dotenv';

import connectDB from './db/db.js';
import signupRoute from './routes/auth/signup.js';
import verifyUserOtp from './routes/auth/verifyUserOtp.js';
import login from './routes/auth/login.js';
import logout from './routes/auth/logout.js';

configDotenv();  // Load environment variables from .env
connectDB();     // Connect to the database

const app = express();

const host = process.env.HOST || '0.0.0.0';  // Default to 'localhost' if HOST is not defined in .env
const port = process.env.PORT || 5000;       // Default to 5000 if PORT is not defined in .env

// Middleware to parse requests with JSON payloads.
app.use(express.json());

// Middleware to log each request method and URL
app.use('/', (req, _, next) => {
    console.log(`${req.method} request to ${req.url}`);
    next();
});

// Routes
app.use('/api', signupRoute);
app.use('/api', verifyUserOtp);
app.use('/api', login);
app.use('/api', logout);

// Starting server
app.listen(port, host, () => {
    console.log(`Server started at http://${host}:${port}`);
});