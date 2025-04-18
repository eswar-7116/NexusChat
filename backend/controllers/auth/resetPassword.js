import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../models/User.js';

export default async function resetPassword(req, res) {
    try {
        // Validate payload
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorArray = errors.array();
            return res.status(400).json({
                success: false,
                message: errorArray[0].msg,
                errors: errorArray
            });
        }

        const { userId, token, password } = req.body;

        // Verify token
        try {
            jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            console.error('Invalid token:', err.message);
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token"
            });
        }

        // Find user
        const user = await User.findById(userId);
        if (!user || !user.isVerified) {
            return res.status(404).json({
                success: false,
                message: "User not found or not verified"
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successful"
        });
    } catch (error) {
        console.error('Error in reset-password:', error.message);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}