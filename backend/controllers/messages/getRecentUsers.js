import User from "../../models/User.js";

export default async function getRecentUsers(req, res) {
    try {
        // Return early if no recent users are there
        if (!req.user.recentUserIds || req.user.recentUserIds.length === 0) {
            return res.status(200).json({
                success: true,
                recentUsers: []
            });
        }

        const recentUserDetails = await User.find(
            { _id: { $in: req.user.recentUserIds } },
            '-password'
        ).lean();  // lean() returns plain JS objects for faster, lesser memory

        return res.status(200).json({
            success: true,
            recentUsers: recentUserDetails
        });
    } catch (error) {
        console.error("Error while getting recent users: " + error.message);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}