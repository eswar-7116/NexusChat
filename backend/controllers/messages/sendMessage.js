import Message from '../../models/Message.js';
import { io, getSocketId } from '../../helpers/socketio.js';

export default async function sendMessage(req, res) {
    try {
        const user = req.user;
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
            senderId: user._id,
            receiverId,
            content: message,
            timestamp: new Date()
        });

        await newMessage.save();

        // Emit socket event
        const receiverSocketId = getSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('newMessage', newMessage);
        }

        // Add receiverId to user's recentUsers array
        if (!user.recentUsers.includes(receiverId)) {
            user.recentUsers.push(receiverId);
            await user.save();
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