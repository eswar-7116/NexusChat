import { Router } from 'express';

import User from '../../models/User.js';
import checkAuth from '../../middleware/authMiddleware.js';

const router = Router();

router.post('/logout', async (req, res) => {
    try {
        // Set user status to offline
        const loggedInUser = await User.findOne({ username: req.user.username });
        loggedInUser.status = 'offline';
        await loggedInUser.save();

        // Clear the token in the cookie
        res.clearCookie('jwtToken');

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        console.error("Error while logging out: "+error.message);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
});

export default router;