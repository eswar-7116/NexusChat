import express from 'express';
import { configDotenv } from 'dotenv';

import { connectDB } from './db/db.js';
import routes from './routes/auth/controller.js';

configDotenv();
connectDB();  // Connecting DB
const app = express();

const host = process.env.HOST;
const port = process.env.PORT;

// Middlewares
app.use(express.json());
app.use('/', (req, _, next) => {
    console.log(`${req.method} request to ${req.url}`);
    next();
});

// Routes
app.use('/api', routes);

// Starting server
app.listen(port, host, () => {
    console.log(`Server started at http://${host}:${port}`);
});