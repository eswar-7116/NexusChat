import { Server } from 'socket.io';
import { createServer } from 'http';
import express from 'express';
import { config } from 'dotenv';
import redis from './redis.js';

import User from '../models/User.js';
import Message from '../models/Message.js';

config();  // Load environment variables from .env
const app = express(); // Express server
const server = createServer(app); // Socket.io server

const ONLINE_USERS_KEY = 'online_users';  // Redis hash key for online users

// Socket.io server
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true
    }
});

// Get socket ID of a user
export async function getSocketId(userId) {
    return await redis.hget(ONLINE_USERS_KEY, userId);
}

// Get all online user IDs
async function getOnlineUserIds() {
    const allFields = await redis.hkeys(ONLINE_USERS_KEY);
    return allFields;
}

// Socket.io connection
io.on('connection', async (socket) => {
    console.log('User connected', socket.id);
    
    // Get user ID from query
    const userId = socket.handshake.query.userId;
    if (userId) { // If user is logged in, add user to online users
        await redis.hset(ONLINE_USERS_KEY, { [userId]: socket.id });  // Add user to online users
    }

    io.emit('getOnlineUsers', await getOnlineUserIds());  // Send online users to client

    await Message.updateMany(
        { receiverId: userId, isRead: false }, // Find all unread messages for the user
        { $set: { isRead: true } }  // Mark them as read to true
    );

    socket.on('disconnect', async () => {
        console.log('User disconnected', socket.id);
        await redis.hdel(ONLINE_USERS_KEY, userId);  // Remove user from online users
        io.emit('getOnlineUsers', await getOnlineUserIds());  // Send online users to client

        const user = await User.findById(userId);  // Find current user by ID
        user.lastSeen = new Date(); // Set lastSeen to current date & time
        await user.save(); // Save changes to database
    });
});

export { io, app, server };