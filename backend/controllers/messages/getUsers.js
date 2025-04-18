import User from "../../models/User.js";

export default async function getUsers(req, res) {
    try {
        const currentUserId = req.user._id;
        const users = await User.find({
            $and: [
                { _id: { $ne: currentUserId } },
                { isVerified: true }
            ]
        }).select("-password").lean();  // returns plain JS objects for faster, lesser memory
        
        return res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        console.error("Error while getting users: "+error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}