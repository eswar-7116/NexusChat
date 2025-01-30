import Message from '../../models/Message.js';

export default async function sendMessage(req, res) {
    try {
        const currentUserId = req.user._id;
        const { id: receiverId } = req.params;
        const { message } = req.body;

        // Save the message to the DB
        const newMessage = Message({
            senderId: currentUserId,
            receiverId,
            content: message,
            timestamp: new Date()
        });
        await newMessage.save();

        // TODO: Use socket.io to send messages

        return res.status(201).json({
            success: true,
            message: newMessage
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error while sending message",
            error: String(error)
        });
    }
}