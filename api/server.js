import express from 'express';
import dotenv from 'dotenv';

import { connectDB } from './db/db.js';

dotenv.config();
connectDB()
const app = express();

const host = process.env.HOST;
const port = process.env.PORT;

app.use('/', (req, _, next) => {
    console.log(`${req.method} request to ${req.url}`);
    next();
});

app.get('/', (req, res) => {
    res.send("<h1>Hello</h1>");
});

app.listen(port, host, () => {
    console.log(`Server started at http://${host}:${port}`);
});