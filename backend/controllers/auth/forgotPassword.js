import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import { sendPasswordResetLink } from '../../helpers/mailers.js';

export default async function forgotPassword(req, res) {
    try {
        // Validate payload
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format",
                errors: errors.array()
            });
        }

        const email = req.body.email;
        const user = await User.findOne({ email }).select('-password');

        if (!user || !user.isVerified) {
            return res.status(404).json({
                status: false,
                message: "User not found with this email"
            });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || "TEST_SECRET",
            { expiresIn: '10m' }
        );

        const link = `${process.env.FRONTEND_URL}/reset-password/${user._id}/${token}`;
        await sendPasswordResetLink(user.fullName, user.email, link);

        res.status(200).json({
            success: true,
            message: `Password reset link sent to the email`,
        });
    } catch (error) {
        console.error('Error in forgot-password:', error.message);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}