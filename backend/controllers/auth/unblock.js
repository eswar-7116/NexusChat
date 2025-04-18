import { getSocketId, io } from "../../helpers/socketio.js";
import User from "../../models/User.js";

export default async function unblock(req, res) {
    try {
        const idToUnblock = req.params.id;
        const userId = req.user._id;

        if (idToUnblock === String(userId)) {
            return res.status(400).json({
                success: false,
                message: "You cannot unblock yourself"
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (!user.blockedUserIds.includes(idToUnblock)) {
            return res.status(400).json({
                success: false,
                message: "User not blocked"
            });
        }

        user.blockedUserIds.pull(idToUnblock);
        await user.save();

        const receipentSocketId = getSocketId(idToUnblock);
        if (receipentSocketId) {
            io.to(receipentSocketId).emit('unblocked', req.user._id);
        }
        
        res.status(200).json({
            success: true,
            message: "User unblocked successfully"
        });
    } catch (error) {
        console.error('Error while unblocking user: ', error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}