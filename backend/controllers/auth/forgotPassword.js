import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import { sendPasswordResetLink } from '../../helpers/mailers.js';

export default async function forgotPassword(req, res) {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format",
                errors: errors.array()
            });
        }

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        // Check if user exists
        const user = await User.findOne({ email }).select('-password');
        if (!user || !user.isVerified) {
            return res.status(404).json({
                success: false,
                message: "User not found or not verified"
            });
        }

        // Generate token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || "TEST_SECRET",
            { expiresIn: '10m' }
        );

        // Generate reset password URL
        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${user._id}/${token}`;

        // Send reset password URL via E-mail
        const mailResult = await sendPasswordResetLink(user.fullName, user.email, resetLink);

        // If sending E-mail failed
        if (!mailResult?.success) {
            return res.status(500).json({
                success: false,
                message: "Failed to send password reset email"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Password reset link sent to email"
        });
    } catch (error) {
        console.error('Error in forgotPassword:', error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}