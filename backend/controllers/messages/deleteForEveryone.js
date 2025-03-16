import { getSocketId, io } from "../../helpers/socketio.js";
import Message from "../../models/Message.js";

export default async function deleteForEveryone(req, res) {
    try {
        const msgId = req.params.msgid;
        const msg = await Message.findById(msgId);
        const userId = req.user._id;

        if (!msg) {
            return res.status(404).json({
                success: false,
                message: "Message Not Found"
            });
        }

        await msg.deleteForEveryone(userId);

        const { senderId, receiverId } = msg;
        let recipientId, deletedByUserId;
        if (userId !== senderId) {
            recipientId = receiverId;
            deletedByUserId = senderId;
        } else {
            recipientId = senderId;
            deletedByUserId = receiverId;
        }
        
        const recipientSocketId = getSocketId(recipientId);
        if (recipientId)
            io.to(recipientSocketId).emit("deleteForEveryone", { msgId, deletedByUserId });

        return res.status(201).json({
            success: true,
            message: "Message deleted for everyone by " + req.user.username
        });
    } catch (error) {
        console.error(`Error while deleting for everyone by ${req.user.username}: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}