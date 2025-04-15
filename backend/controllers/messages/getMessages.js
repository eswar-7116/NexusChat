import Message from "../../models/Message.js";
import mongoose from "mongoose";

export default async function getMessages(req, res) {
    try {
        const currentUserId = req.user._id;
        const { id: receiverId } = req.params;

        // Validate that the receiverId is a valid ObjectId string.
        if (!mongoose.isValidObjectId(receiverId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid receiver ID"
            });
        }

        // Get messages b/w current user and receiver
        const messages = await Message.find({
            $or: [
                { senderId: currentUserId, receiverId },
                { senderId: receiverId, receiverId: currentUserId }
            ]
        }).lean();  // returns plain JS objects for faster, lesser memory

        return res.status(200).json({
            success: true,
            messages
        });
    } catch (error) {
        console.error("Error while getting messages: " + error.message);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}
