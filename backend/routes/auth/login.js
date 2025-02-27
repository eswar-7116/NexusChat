import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import User from '../../models/User.js';

const router = Router();

router.post('/login',[
    // Validate username
    body('username')
        .not().isEmpty().withMessage('Username is required')
        .matches(/^[a-zA-Z][a-zA-Z0-9._-]{3,32}$/).withMessage('Username must start with a letter and contain only letters, numbers, dots, underscores, or hyphens, and be between 4 and 33 characters long'),
    
    // Validate password
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/[a-zA-Z]/).withMessage('Password must contain at least one alphabet')
        .matches(/\d/).withMessage('Password must contain at least one number')
], async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Input validation failed while logging in",
                errors: errors.array()
            });
        }

        // Check if an account is already logged in
        if (req.cookies.jwtToken) {
            return res.status(401).json({
                status: false,
                message: 'An account is already logged in'
            });
        }

        const { username, password } = req.body;

        // Check if username exists
        const user = await User.findOne({ username });
        if (!user || !user.isVerified) {
            return res.status(404).json({
                status: false,
                message: 'User not found'
            });
        }

        // Check if password is correct
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                status: false,
                message: 'Incorrect password'
            });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || "TEST_SECRET",
            { expiresIn: '7d' }
        );

        // Save the token in cookie
        res.cookie("jwtToken", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,      // Prevents XSS attacks
            sameSite: 'strict',  // Prevents CSRF attacks
            secure: process.env.NODE_ENV !== 'development'
        });

        res.status(200).json({
            success: true,
            message: `${username} logged in`,
            user,
            token
        });
    } catch (error) {
        console.error('Error while logging in:', error.message);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
});

export default router;