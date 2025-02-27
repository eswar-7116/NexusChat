import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';

import User from '../../models/User.js';
import { sendVerificationOtp } from "../../helpers/otpSender.js";

const router = Router();

router.post('/signup', [
    // Validate username
    body('username')
        .not().isEmpty().withMessage('Username is required')
        .matches(/^[a-zA-Z][a-zA-Z0-9._-]{3,32}$/).withMessage('Username must start with a letter and contain only letters, numbers, dots, underscores, or hyphens, and be between 4 and 33 characters long'),

    // Validate email
    body('email').isEmail().withMessage('Invalid email format'),

    // Validate password
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/[a-zA-Z]/).withMessage('Password must contain at least one alphabet')
        .matches(/\d/).withMessage('Password must contain at least one number')
], async (req, res) => {
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
        
        const { fullName, username, email } = req.body;
        let password = req.body.password;

        // Check if username exists and is verified
        const existingUsername = await User.findOne({ username });
        if (existingUsername && existingUsername.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'Username is already taken.'
            });
        }

        // Check if email is already registered and verified
        const existingEmail = await User.findOne({ email });
        if (existingEmail && existingEmail.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email is already registered.'
            });
        }

        // Hash the password
        password = await bcrypt.hash(password, 10);

        // Generate a secure OTP and set its expiry to 10 minutes
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        const otpExpiry = new Date();
        otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

        // Send the OTP
        const senderResponse = await sendVerificationOtp(fullName, email, otp);
        if (!senderResponse.success) {
            return res.status(400).json({
                success: false,
                message: "Failed to send OTP"
            });
        }

        // Handle existing user cases (username or email already exists but not verified)
        if (existingUsername && !existingUsername.isVerified) {
            existingUsername.fullName = fullName;
            existingUsername.email = email;
            existingUsername.password = password;
            existingUsername.createdAt = new Date();
            existingUsername.lastSeen = new Date();
            existingUsername.otp = otp;
            existingUsername.otpExpiry = otpExpiry;
           
            await existingUsername.save();
           
            return res.status(200).json({
                success: true,
                message: "User registered successfully"
            });
        }

        if (existingEmail && !existingEmail.isVerified) {
            existingEmail.fullName = fullName;
            existingEmail.username = username;
            existingEmail.password = password;
            existingEmail.createdAt = new Date();
            existingEmail.lastSeen = new Date();
            existingEmail.otp = otp;
            existingEmail.otpExpiry = otpExpiry;
            
            await existingEmail.save();
            
            return res.status(200).json({
                success: true,
                message: "User registered successfully"
            });
        }

        // Save the new user if username and email don't exist
        await new User({
            fullName,
            username,
            email,
            password,
            createdAt: new Date(),
            lastSeen: new Date(),
            otp,
            otpExpiry,
            isVerified: false
        }).save();

        return res.status(201).json({
            success: true,
            message: "User registered successfully"
        });
    } catch (error) {
        console.error('Error while signing up:', error.message);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
});

export default router;
