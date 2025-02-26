import { Router } from 'express';

import User from '../../models/User.js';
import cloudinary from '../../helpers/cloudinaryConfig.js';

const router = Router();

router.post('/edit-profile', async (req, res) => {
    try {
        const { profilePic } = req.body;
        const userId = req.user._id;

        if (!profilePic) {
            return res.status(400).json({
                success: false,
                message: "Profile picture not given"
            });
        }

        const picUploadRes = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(
            { _id: userId },
            { profilePic: picUploadRes.secure_url },
            { new: true }
        );
        await updatedUser.save();

        res.status(200).json({
            success: true,
            message: "Profile picture updated successfully",
            user: updatedUser
        });
    } catch (error) {
        console.error("Error while editing profile: " + error.message);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
});

export default router;