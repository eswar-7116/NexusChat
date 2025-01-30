import User from "../../models/User.js";

export default async function getMessages(req, res) {
    try {
        const currentUserId = req.user._id;
        const { id: receiverId } = req.params;
        
        // Get messages b/w user and receiver
        const messages = await User.find({
            $or: [
                { senderId: currentUserId, receiverId },
                { senderId: receiverId, receiverId: currentUserId }
            ]
        });

        return res.status(200).json({
            success: true,
            messages
        });
    } catch (error) {
        console.error("Error while getting messages: "+error);
        return res.status(500).json({
            status: true,
            message: "Error while getting recent users",
            error: String(error)
        });
    }
}