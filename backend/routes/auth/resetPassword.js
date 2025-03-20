import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import User from '../../models/User.js';

const router = Router();

router.post('/reset-password',
    // Validate password
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/[a-zA-Z]/).withMessage('Password must contain at least one alphabet')
        .matches(/\d/).withMessage('Password must contain at least one number'),
    async (req, res) => {
        try {
            // Validate payload
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: "Input validation failed while signing up",
                    errors: errors.array()
                });
            }

            const { userId, token } = req.body;
            let password = req.body.password;

            jwt.verify(token, process.env.JWT_SECRET, async (err, _) => {
                if (err) {
                    console.error('Invalid token:', err.message);
                    return res.status(401).json({
                        success: false,
                        message: "Invalid token"
                    });
                } else {
                    // Find user
                    console.log("UID: " + userId);
                    const user = await User.findById(userId);

                    if (!user || !user.isVerified) {
                        return res.status(404).json({
                            success: false,
                            message: "User not found or not verified"
                        });
                    }

                    // Hash the password
                    try {
                        password = await bcrypt.hash(password, 10);
                    } catch (error) {
                        console.log("Error hashing the password in /reset-password ", error);
                        return res.status(500).json({
                            success: false,
                            message: "Internal Server Error while hashing password"
                        });
                    }

                    user.password = password;

                    try {
                        await user.save();
                        res.status(200).json({
                            success: true,
                            message: "Password reset successful",
                        });
                    } catch (saveError) {
                        console.error('Error saving user:', saveError.message);
                        return res.status(500).json({
                            success: false,
                            message: "Internal Server Error while saving user"
                        });
                    }
                }
            });
        } catch (error) {
            console.error('Error in reset-password:', error.message);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });
        }
    }
);

export default router;