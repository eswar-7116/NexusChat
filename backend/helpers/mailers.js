import nodemailer from 'nodemailer';
import { configDotenv } from 'dotenv';

configDotenv();

// Create the transporter with the credentials
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export async function sendVerificationOtp(fullname, toEmail, otp) {
    try {
        // Send the email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: toEmail,
            subject: 'NexusChat User Verification OTP',
            text: `Hello, ${fullname}, your OTP for NexusChat's user registration is: ${otp}. It will expire in 10 minutes. Do not share with anyone.`
        });

        // Return success after sending email
        return { success: true, message: "OTP Sent successfully" };
    } catch (err) {
        // Catch and log any errors that occur while sending the email
        console.error("Error sending verification OTP: " + err.message);
        return { success: false, message: "Internal Server Error" };
    }
}

export async function sendPasswordResetLink(fullname, toEmail, link) {
    try {
        // Send the email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: toEmail,
            subject: `Password Reset Link for ${fullname}'s NexusChat Account`,
            text: `Hello, ${fullname}, your password reset link is ${link}. It will expire in 10 minutes. Do not share with anyone.`
        });

        // Return success after sending email
        return { success: true, message: "Password reset link sent successfully" };
    } catch (err) {
        // Catch and log any errors that occur while sending the email
        console.error("Error sending reset link: " + err.message);
        return { success: false, message: "Internal Server Error" };
    }
}
