import nodemailer from 'nodemailer';
import { configDotenv } from 'dotenv';

configDotenv();

// Create the transporter with the credentials
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export async function sendVerificationOtp(fullname, toEmail, otp) {
    try {
        // Send the email
        await transporter.sendMail({
            from: `"NexusChat" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: 'NexusChat User Verification OTP',
            text: `Hello, ${fullname}, your OTP for NexusChat's user registration is: ${otp}. It will expire in 10 minutes. Do not share with anyone.`,
            html: `<p>Hello <strong>${fullname}</strong>,</p>
                   <p>Your OTP for <strong>NexusChat</strong> is: <strong>${otp}</strong>.</p>
                   <p>This OTP will expire in 10 minutes. Please do not share it with anyone.</p>
                   <br/>
                   <p>Regards,<br/>NexusChat Team</p>`
        });

        // Return success after sending email
        return { success: true, message: "OTP Sent successfully" };
    } catch (err) {
        // Catch and log any errors that occur while sending the email
        console.error("Error sending verification OTP: " + err);
        return { success: false, message: "Internal Server Error" };
    }
}

export async function sendPasswordResetLink(fullname, toEmail, link) {
    try {
        // Send the email
        await transporter.sendMail({
            from: `"NexusChat" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: `Password Reset Link for ${fullname}'s NexusChat Account`,
            text: `Hello, ${fullname}, your password reset link is ${link}. This link will expire in 10 minutes. Do not share with anyone.`,
            html: `<p>Hello <strong>${fullname}</strong>,</p>
                   <p>You requested a password reset for your <strong>NexusChat</strong> account.</p>
                   <p>
                       Please click the link below to reset your password:<br/>
                       <a href="${link}" style="color: #1a73e8; text-decoration: none;">
                           ${link}
                       </a>
                   </p>
                   <p><em>This link will expire in 10 minutes. Do not share it with anyone.</em></p>
                   <br/>
                   <p>Regards,<br/>
                   The NexusChat Team</p>`
        });

        // Return success after sending email
        return { success: true, message: "Password reset link sent successfully" };
    } catch (err) {
        // Catch and log any errors that occur while sending the email
        console.error("Error sending reset link: " + err);
        return { success: false, message: "Internal Server Error" };
    }
}
