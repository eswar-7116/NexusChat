import User from "../../models/User.js";

export default async function getRecentUsers(req, res) {
    try {
        const recentUserDetails = await User.find({
            _id: { $in: req.user.recentUsers }
        }).select('-password');

        return res.status(200).json({
            success: true,
            recentUsers: recentUserDetails
        });
    } catch (error) {
        console.error("Error while getting recent users: "+error.message);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}