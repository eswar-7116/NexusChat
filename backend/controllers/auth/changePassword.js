import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import User from '../../models/User.js';

export default async function changePassword(req, res) {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Input validation failed while changing password",
                errors: errors.array()
            });
        }

        // Check if no user is logged in
        if (!req.cookies.jwtToken) {
            return res.status(401).json({
                status: false,
                message: 'Unauthorized - No login detected'
            });
        }

        const { oldPassword } = req.body;
        let newPassword = req.body.newPassword;

        const user = await User.findById(req.user._id);

        // Check if old password is correct
        const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                status: false,
                message: 'Incorrect password'
            });
        }

        // Hash the new password
        newPassword = await bcrypt.hash(newPassword, 10);

        // Update the new password
        user.password = newPassword;
        await user.save();

        return res.status(201).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Error while changing password: ', error.message);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}