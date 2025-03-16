import { getSocketId, io } from "../../helpers/socketio.js";
import Message from "../../models/Message.js";

export default async function readUnread(req, res) {
    try {
        const senderId = req.params.id;
        const userId = req.user._id;

        await Message.updateMany(
            { receiverId: userId, senderId, isRead: false }, // Filter unread messages
            { $set: { isRead: true } } // Update isRead to true
        );
        
        const senderSocketId = getSocketId(senderId);
        if (senderSocketId)
            io.to(senderSocketId).emit("messagesRead", userId);

        return res.status(201).json({
            success: true,
            message: `Read unread messages b/w ${userId}" & ${senderId}`
        });
    } catch (error) {
        console.error("Error while reading unread messages: "+error.message)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}