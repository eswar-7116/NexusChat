import User from "../../models/User.js";
import Message from "../../models/Message.js";

export default async function getRecentUsers(req, res) {
    try {
        // Return early if no recent users are there
        if (!req.user.recentUserIds || req.user.recentUserIds.length === 0) {
            return res.status(200).json({ success: true, recentUsers: [] });
        }

        // Fetch the recent users
        const recentUserDetails = await User.find(
            { _id: { $in: req.user.recentUserIds } },
            '-password'
        ).lean();

        // Fetch the last message for each user
        const recentUsersWithLastMessage = await Promise.all(
            recentUserDetails.map(async (user) => {
                // Find the latest message between current user and this user
                const lastMessage = await Message.findOne({
                    $or: [
                        { senderId: req.user._id, receiverId: user._id },
                        { senderId: user._id, receiverId: req.user._id }
                    ],
                    deletedFor: { $ne: req.user._id } // Don't include messages deleted by the requesting user
                }).select('timestamp').sort({ timestamp: -1 }).lean();

                return {
                    ...user,
                    lastMessageAt: lastMessage ? lastMessage.timestamp : user.createdAt
                };
            })
        );

        // Sort by the timestamp of the last message
        const sortedRecentUsers = recentUsersWithLastMessage.sort((a, b) =>
            new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
        );

        return res.status(200).json({
            success: true,
            recentUsers: sortedRecentUsers
        });
    } catch (error) {
        console.error("Error while getting recent users: " + error.message);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}