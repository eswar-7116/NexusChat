import { validationResult } from 'express-validator';
import User from '../../models/User.js';

export default async function verifyUserOtp(req, res) {
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
        console.error('Error while verifying user:', error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}