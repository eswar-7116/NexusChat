import { Server } from 'socket.io';
import { createServer } from 'http';
import express from 'express';

const app = express(); // Express server
const server = createServer(app); // Socket.io server

// Socket.io server
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

const onlineUsers = {};  // Object to store online users

// Get socket ID of a user
export function getSocketId(userId) {
    return onlineUsers[userId];
}

// Socket.io connection
io.on('connection', (socket) => {
    console.log('User connected', socket.id);
    
    // Get user ID from query
    const userId = socket.handshake.query.userId;
    if (userId) { // If user is logged in, add user to online users
        onlineUsers[userId] = socket.id;  // Add user to online users
    }

    io.emit('getOnlineUsers', Object.keys(onlineUsers));  // Send online users to client

    socket.on('disconnect', () => {
        console.log('User disconnected', socket.id);
        delete onlineUsers[userId];  // Remove user from online users
        io.emit('getOnlineUsers', Object.keys(onlineUsers));  // Send online users to client
    });
});

export { io, app, server };