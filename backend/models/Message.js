import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    content: {
        type: String,
        required: true,
        trim: true
    },
    
    timestamp: {
        type: Date,
        default: new Date(),
        required: true
    },

    isRead: {
        type: Boolean,
        default: false
    }
});

const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

export default Message;