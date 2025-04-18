import { getSocketId, io } from "../../helpers/socketio.js";
import Message from "../../models/Message.js";

export default async function deleteForMe(req, res) {
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

        await msg.deleteForUser(userId);

        const { senderId, receiverId } = msg;
        
        let recipientId, deletedByUserId;
        if (userId !== senderId) {
            recipientId = senderId;
            deletedByUserId = receiverId;
        } else {
            recipientId = receiverId;
            deletedByUserId = senderId;
        }
        
        const recipientSocketId = getSocketId(recipientId);

        if (recipientId)
            io.to(recipientSocketId).emit("deleteForMe", {msgId, deletedByUserId});

        return res.status(201).json({
            success: true,
            message: "Message deleted for " + req.user.username
        });
    } catch (error) {
        console.error(`Error while deleting for ${req.user.username}: ` + error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}