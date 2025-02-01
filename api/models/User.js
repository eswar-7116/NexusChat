import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true
    },

    username: {
        type: String,
        required: [true, 'Username is required'],
        trim: true,
        unique: true,
        index: true
    },

    email: {
        type: String,
        required: [true, 'E-mail is required'],
        unique: true,
        match: [/.+\@.+\..+/, 'Enter a valid email'],
        index: true
    },

    password: {
        type: String,
        required: [true, 'Password hash is required']
    },

    createdAt: {
        type: Date,
        default: new Date(),
        required: [true, 'Creation time is required']
    },

    status: {
        type: String,
        enum: ['online', 'offline']
    },

    lastSeen: {
        type: Date
    },

    otp: {
        type: String,
        required: [true, 'OTP is required']
    },

    otpExpiry: {
        type: Date,
        required: [true, 'OTP Expiry is required']
    },

    isVerified: {
        type: Boolean,
        default: false,
        required: [true, 'isVerified is required']
    },

    recentUsers: {
        type: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'UserModel',
                    required: true
                },
                lastMessageAt: {
                    type: Date,
                    required: true,
                    default: Date.now
                }
            }
        ]
    }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;