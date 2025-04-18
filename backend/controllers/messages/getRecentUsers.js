import User from "../../models/User.js";
import Message from "../../models/Message.js";

export default async function getRecentUsers(req, res) {
    try {
        const { recentUserIds, _id: currentUserId } = req.user;

        if (!recentUserIds || recentUserIds.length === 0) {
            return res.status(200).json({ success: true, recentUsers: [] });
        }

        // Fetch data of recent users
        const recentUsers = await User.find(
            { _id: { $in: recentUserIds } },
            '-password'
        ).lean();

        // Attach the last message timestamp for each user
        const usersWithLastMessage = await Promise.all(
            recentUsers.map(async (user) => {
                const lastMessage = await Message.findOne({
                    $or: [
                        { senderId: currentUserId, receiverId: user._id },
                        { senderId: user._id, receiverId: currentUserId }
                    ],
                    deletedFor: { $ne: currentUserId }
                })
                    .select('timestamp')
                    .sort({ timestamp: -1 })
                    .lean();

                return {
                    ...user,
                    lastMessageAt: lastMessage?.timestamp || user.createdAt
                };
            })
        );

        // Sort by last message time in descendingn order
        usersWithLastMessage.sort((a, b) =>
            new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
        );

        return res.status(200).json({
            success: true,
            recentUsers: usersWithLastMessage
        });
    } catch (error) {
        console.error("Error while getting recent users:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}