import Message from '../../models/Message.js';
import User from '../../models/User.js';
import { io, getSocketId } from '../../helpers/socketio.js';

export default async function sendMessage(req, res) {
    try {
        const senderId = req.user._id;
        const { id: receiverId } = req.params;
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Please pass a message to send"
            });
        }

        // Fetch both sender and receiver data
        const [senderData, receiverData] = await Promise.all([
            User.findById(senderId, 'recentUserIds blockedUserIds'),
            User.findById(receiverId, 'recentUserIds blockedUserIds')
        ]);

        // Check if receiver exists
        if (!receiverData) {
            return res.status(404).json({
                success: false,
                message: "Receiver not found"
            });
        }

        // Check block status
        if (senderData.blockedUserIds?.includes(receiverId)) {
            return res.status(403).json({
                success: false,
                message: "You have blocked this user"
            });
        }

        if (receiverData.blockedUserIds?.includes(senderId)) {
            return res.status(403).json({
                success: false,
                message: "You are blocked by the receiver"
            });
        }

        // Create and save message
        const newMessage = await Message.create({
            senderId,
            receiverId,
            content: message,
            timestamp: new Date()
        });

        // Emit message to receiver if online
        const receiverSocketId = getSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('newMessage', newMessage);
        }

        // Update recentUserIds if needed
        const updateOps = [];

        if (!senderData.recentUserIds.includes(receiverId)) {
            updateOps.push(User.updateOne(
                { _id: senderId },
                { $push: { recentUserIds: receiverId } }
            ));
        }

        if (!receiverData.recentUserIds.includes(senderId)) {
            updateOps.push(User.updateOne(
                { _id: receiverId },
                { $push: { recentUserIds: senderId } }
            ));
        }

        if (updateOps.length > 0) {
            await Promise.all(updateOps);
        }

        return res.status(201).json({
            success: true,
            chat: newMessage
        });
    } catch (error) {
        console.error("Error while sending message:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}