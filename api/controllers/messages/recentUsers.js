export default async function getRecentUsers(req, res) {
    try {
        const recentUsers = req.user.recentUsers;
        
        // Sort recent users by last chatted time in descending order
        recentUsers.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
        
        return res.status(200).json({
            success: true,
            recentUsers
        });
    } catch (error) {
        console.error("Error while getting recent users: "+error);
        return res.status(500).json({
            success: false,
            message: "Error while getting recent users",
            error: String(error)
        });
    }
}