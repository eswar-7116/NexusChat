import { getSocketId, io } from "../../helpers/socketio.js";
import Message from "../../models/Message.js";
import User from "../../models/User.js";
import mongoose from "mongoose";

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
        
        let blocked = false, blockedByUser;
        if (req.user.blockedUserIds && req.user.blockedUserIds.length !== 0) {
            if (req.user.blockedUserIds.includes(senderId)) {
                blocked = true;
                blockedByUser = true;
            }
        }

        if (!blocked) {
            const user = await User.findById(senderId, 'blockedUserIds');
            if (user.blockedUserIds && user.blockedUserIds.length !== 0) {
                if (user.blockedUserIds.includes(req.user._id)) {
                    blocked = true;
                    blockedByUser = false;
                }
            }
        }

        return res.status(201).json({
            success: true,
            blocked,
            blockedByUser: blockedByUser || false,
            message: `Read unread messages b/w ${userId}" & ${senderId}`
        });
    } catch (error) {
        console.error("Error while reading unread messages: "+error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}