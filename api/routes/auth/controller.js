import { Router } from "express";
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';

import User from '../../models/User.js';
import { sendVerificationOtp } from "../../helpers/otpSender.js";

const router = Router();

// Signup
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
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Input validation failed while signing up",
                errors: errors.array()
            });
        }

        const { username, email } = req.body;
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
        const senderResponse = await sendVerificationOtp(username, email, otp);
        if (! senderResponse.success) {
            return res.status(400).json({
                success: false,
                message: "Failed to send OTP"
            });
        }

        // If username exists but it is not verified
        if (existingUsername && !existingUsername.isVerified) {
            existingUsername.email = email;
            existingUsername.password = password;
            existingUsername.createdAt = new Date();
            existingUsername.status = 'online';
            existingUsername.lastSeen = new Date();
            existingUsername.otp = otp;
            existingUsername.otpExpiry = otpExpiry;
            (await existingUsername).save();

            return res.status(201).json({
                success: true,
                message: "User registered successfully"
            });
        }

        // If email is registered but not verified
        if (existingEmail && !existingEmail.isVerified) {
            existingEmail.username = username;
            existingEmail.password = password;
            existingEmail.createdAt = new Date();
            existingEmail.status = 'online';
            existingEmail.lastSeen = new Date();
            existingEmail.otp = otp;
            existingEmail.otpExpiry = otpExpiry;
            (await existingEmail).save();

            return res.status(201).json({
                success: true,
                message: "User registered successfully"
            });
        }

        // Save the new user
        (await new User({
            username,
            email,
            password,
            createdAt: new Date(),
            status: 'online',
            lastSeen: new Date(),
            otp,
            otpExpiry,
            isVerified: false
        })).save();

        return res.status(201).json({
            success: true,
            message: "User registered successfully"
        });
    } catch(error) {
        console.error('Error while signing up:', error);
        return res.status(500).json({
            success: false,
            message: "Error while signing up",
            error: String(error)
        });
    }
});

// Verify user
router.post('/verify-user', async (req, res) => {
    try {
        const { username, otp } = req.body;

        // Check if user exists
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User doesn't exist"
            });
        }

        // Check if user is already verified
        if (user.isVerified) {
            return res.status(401).json({
                success: false,
                message: "User already verified"
            });
        }

        // Check if OTP is expired
        if ((new Date()) > user.otpExpiry) {
            return res.status(401).json({
                success: false,
                message: "OTP expired! Generate a new OTP"
            });
        }

        // Verify OTP
        if (user.otp !== otp) {
            return res.status(401).json({
                success: false,
                message: "Incorrect OTP!"
            });
        }

        user.isVerified = true;
        await user.save();

        return res.status(201).json({
            success: true,
            message: "User verified"
        });
    } catch(error) {
        console.error('Error while verifying user:', error);
        return res.status(500).json({
            success: false,
            message: "Error while verifying user",
            error: String(error)
        });
    }
});

export default router;