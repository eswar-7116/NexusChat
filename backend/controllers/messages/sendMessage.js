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

    // Save message
    const newMessage = await Message.create({
      senderId,
      receiverId,
      content: message,
      timestamp: new Date()
    });

    // Emit to receiver
    const receiverSocketId = getSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('newMessage', newMessage);
    }

    // Fetch only recentUserIds of both users
    const [senderData, receiverData] = await Promise.all([
      User.findById(senderId, 'recentUserIds'),
      User.findById(receiverId, 'recentUserIds')
    ]);

    const senderNeedsUpdate = !senderData.recentUserIds.includes(receiverId);
    const receiverNeedsUpdate = !receiverData.recentUserIds.includes(senderId);

    const updates = [];

    if (senderNeedsUpdate) {
      updates.push(
        User.updateOne(
          { _id: senderId },
          { $push: { recentUserIds: receiverId } }
        )
      );
    }

    if (receiverNeedsUpdate) {
      updates.push(
        User.updateOne(
          { _id: receiverId },
          { $push: { recentUserIds: senderId } }
        )
      );
    }

    if (updates.length > 0) {
      await Promise.all(updates); // Execute only if updates are needed
    }

    return res.status(201).json({
      success: true,
      chat: newMessage
    });
  } catch (error) {
    console.error("Error while sending message:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
}