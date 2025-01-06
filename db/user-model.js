const mongoose = require('mongoose');

const UserSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "Please enter username"],
            unique: true,
            index: true
        },

        passwordHash: {
            type: String,
            required: [true, "Please enter password hash"]
        },

        email: {
            type: String,
            required: [true, "Please enter email."],
            match: [/\S+@\S+\.\S+/, "Please enter a valid email."],
            unique: true,
            index: true
        },

        userImg: {
            type: String,
            required: false
        },

        online: {
            type: Boolean,
            default: false
        }
    }, {
        timestamps: true
    }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;
