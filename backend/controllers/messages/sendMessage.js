import Message from '../../models/Message.js';

export default async function sendMessage(req, res) {
    try {
        const currentUserId = req.user._id;
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
            senderId: currentUserId,
            receiverId,
            content: message,
            timestamp: new Date()
        });
        await newMessage.save();

        // TODO: Use socket.io to send messages

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