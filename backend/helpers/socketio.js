import { Server } from 'socket.io';
import { createServer } from 'http';
import express from 'express';

const app = express();
const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    console.log('User connected', socket.id);
    socket.on('disconnect', () => {
        console.log('User disconnected', socket.id);
    });
});

export { io, app, server };