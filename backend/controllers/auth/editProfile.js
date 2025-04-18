import User from '../../models/User.js';
import cloudinary from '../../helpers/cloudinaryConfig.js';

export default async function editProfile(req, res) {
    try {
        const { profilePic } = req.body;
        const userId = req?.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User not found"
            });
        }

        if (!profilePic) {
            return res.status(400).json({
                success: false,
                message: "Profile picture not provided"
            });
        }

        // Upload to Cloudinary
        const picUploadRes = await cloudinary.uploader.upload(profilePic, {
            folder: 'user_profiles',
            transformation: [{ width: 300, height: 300, crop: 'fill' }],
            quality: 'auto'
        });

        if (!picUploadRes?.secure_url) {
            return res.status(400).json({
                success: false,
                message: "Image upload failed"
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: picUploadRes.secure_url },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile picture updated successfully",
            user: updatedUser
        });
    } catch (error) {
        console.error("Error while editing profile:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}