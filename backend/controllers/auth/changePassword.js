import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import User from '../../models/User.js';

export default async function changePassword(req, res) {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorArray = errors.array();
            return res.status(400).json({
                success: false,
                message: errorArray[0].msg,
                errors: errorArray
            });
        }

        const { oldPassword, newPassword } = req.body;

        // Fetch user from DB
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect old password'
            });
        }

        // Hash and update new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Error while changing password:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
}