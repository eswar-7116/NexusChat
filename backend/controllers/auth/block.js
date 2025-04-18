import { getSocketId, io } from "../../helpers/socketio.js";
import User from "../../models/User.js";

export default async function block(req, res) {
    try {
        const idToBlock = req.params.id;
        const userId = req.user._id;

        if (idToBlock === String(userId)) {
            return res.status(400).json({
                success: false,
                message: "You cannot block yourself"
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.blockedUserIds.includes(idToBlock)) {
            return res.status(400).json({
                success: false,
                message: "User already blocked"
            });
        }

        user.blockedUserIds.push(idToBlock);
        await user.save();

        const receipentSocketId = getSocketId(idToBlock);
        if (receipentSocketId) {
            io.to(receipentSocketId).emit('blocked', req.user._id);
        }
        
        res.status(200).json({
            success: true,
            message: "User blocked successfully"
        });
    } catch (error) {
        console.error('Error while blocking user: ', error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}