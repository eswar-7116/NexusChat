import Message from "../../models/Message.js";

export default async function readUnread(req, res) {
    try {
        await Message.updateMany(
            { receiverId: req.user._id, senderId: req.params.id, isRead: false }, // Filter unread messages
            { $set: { isRead: true } } // Update isRead to true
        );        

        return res.status(201).json({
            success: true,
            message: "Read unread messages of " + req.user.username
        });
    } catch (error) {
        console.error("Error while reading unread: "+error.message)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}