import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';

import User from '../../models/User.js';
import { sendVerificationOtp } from "../../helpers/mailers.js";
import generateOTP from '../../helpers/otpGenerator.js';

const OTP_EXPIRY_MINUTES = 10;

export default async function signup(req, res) {
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

        const { fullName, username, email, password: plainPassword } = req.body;

        // Check if username or email already exists
        const [existingUsername, existingEmail] = await Promise.all([
            User.findOne({ username }),
            User.findOne({ email })
        ]);

        if (existingUsername?.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'Username is already taken.'
            });
        }

        if (existingEmail?.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email is already registered.'
            });
        }

        // Hash password and generate OTP
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60000);

        // Send OTP
        const senderResponse = await sendVerificationOtp(fullName, email, otp);
        if (!senderResponse.success) {
            return res.status(400).json({
                success: false,
                message: "Failed to send OTP"
            });
        }

        // Update existing unverified user or create new user
        const updateUser = async (user) => {
            user.fullName = fullName;
            user.username = username;
            user.email = email;
            user.password = hashedPassword;
            user.otp = otp;
            user.otpExpiry = otpExpiry;
            user.createdAt = new Date();
            user.lastSeen = new Date();
            await user.save();
        };

        if (existingUsername && !existingUsername.isVerified) {
            await updateUser(existingUsername);
        } else if (existingEmail && !existingEmail.isVerified) {
            await updateUser(existingEmail);
        } else {
            await new User({
                fullName,
                username,
                email,
                password: hashedPassword,
                createdAt: new Date(),
                lastSeen: new Date(),
                otp,
                otpExpiry,
                isVerified: false
            }).save();
        }

        return res.status(201).json({
            success: true,
            message: "User registered successfully"
        });
    } catch (error) {
        console.error('Error while signing up:', error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}