import { Router } from 'express';
import { body, validationResult } from 'express-validator';

import User from '../../models/User.js';

const router = Router();

router.post('/verify-user-otp', [
    body('username')
        .not().isEmpty().withMessage('Username is required')
        .matches(/^[a-zA-Z][a-zA-Z0-9._-]{3,32}$/).withMessage('Username must start with a letter and contain only letters, numbers, dots, underscores, or hyphens, and be between 4 and 33 characters long'),
    body('otp')
        .isNumeric().withMessage('OTP must contain digits only')
        .matches(/^\d{6}$/).withMessage('OTP length must be 6')
], async (req, res) => {
    try {
        // Validate payload
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Input validation failed while verifying OTP",
                errors: errors.array()
            });
        }

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

        // Set isVerified to true for the user and save
        user.isVerified = true;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "User verified"
        });
    } catch (error) {
        console.error('Error while verifying user:', error.message);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
});

export default router;
