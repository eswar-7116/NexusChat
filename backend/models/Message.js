import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    content: {
        type: String,
        required: true,
        trim: true
    },
    
    timestamp: {
        type: Date,
        default: () => new Date(),
        required: true
    },

    isRead: {
        type: Boolean,
        default: false,
        index: true
    },

    deletedFor: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        default: () => [],
        index: true
    },

    deletedForEveryoneBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

messageSchema.methods.deleteForUser = async function(userId) {
    if (!this.deletedFor.includes(userId)) {
        this.deletedFor.push(userId);
        await this.save();
    }
};

messageSchema.methods.deleteForEveryone = async function(userId) {
    if (!this.deletedForEveryoneBy) {
        this.deletedForEveryoneBy = userId;
        await this.save();
    }
};

const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

export default Message;