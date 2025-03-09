import Message from '../../models/Message.js';
import { io, getSocketId, onlineUsers } from '../../helpers/socketio.js';

export default async function sendMessage(req, res) {
    try {
        const currentUserId = req.user._id;
        const { id: receiverId } = req.params;
        const { message } = req.body;

        // Check if message is sent
        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Please pass a message to send"
            });
        }

        // Save the message to the DB
        const newMessage = Message({
            senderId: currentUserId,
            receiverId,
            content: message,
            timestamp: new Date()
        });

        if (receiverId in onlineUsers)
            newMessage.isRead = true;
        await newMessage.save();

        const receiverSocketId = getSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('newMessage', newMessage);
        }

        return res.status(201).json({
            success: true,
            chat: newMessage
        });
    } catch (error) {
        console.error("Error while sending message: "+error.message)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}