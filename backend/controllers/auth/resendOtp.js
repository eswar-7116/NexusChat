import User from '../../models/User.js';
import { sendVerificationOtp } from "../../helpers/mailers.js";
import generateOTP from '../../helpers/otpGenerator.js';
import redis, { OTP_EXPIRY_SECONDS } from '../../helpers/redis.js';

export default async function resendOTP(req, res) {
    try {
        // Fetch user data
        const user = await User.findOne({ username: req.params.username });

        // Check if user exists
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user is already verified
        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'User is already verified'
            });
        }

        // Generate a new OTP
        const otp = generateOTP();

        // Store OTP in Redis with TTL
        await redis.set(`otp:${user.username}`, otp, { ex: OTP_EXPIRY_SECONDS });

        // Send the OTP via email
        const emailResult = await sendVerificationOtp(
            user.fullname,
            user.email,
            otp
        );

        if (!emailResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to send OTP. Please try again later.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'OTP has been resent to your email'
        });
    } catch (error) {
        console.error('Error in resendOTP controller:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};