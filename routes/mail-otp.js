require('dotenv').config();
const nodemailer = require('nodemailer');
const mail = process.env.EMAIL;
const fs = require('fs');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: mail,
        pass: process.env.EMAIL_PASS
    }
});

async function sendOtpToMail(userMail) {
    const otp = Math.floor(
        Math.random() * 1_000_000
    ).toString().padStart(6, '0');

    const mailBody = fs.readFileSync('views/mail.html', 'utf-8').replace('{{otp}}', otp);
    
    await transporter.sendMail({
        from: mail,
        to: userMail,
        subject: 'NexusChat OTP Code',
        html: mailBody
    });
}

module.exports = sendOtpToMail;
