import Message from "../../models/Message.js";
import mongoose from "mongoose";

const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 100;

export default async function getMessages(req, res) {
    try {
        const currentUserId = req.user._id;
        const { id: receiverId } = req.params;

        // Validate that the receiverId is a valid ObjectId string.
        if (!mongoose.isValidObjectId(receiverId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid receiver ID"
            });
        }

        // Parse pagination params
        const limit = Math.min(
            Math.max(parseInt(req.query.limit) || DEFAULT_LIMIT, 1),
            MAX_LIMIT
        );
        const before = req.query.before; // ISO timestamp cursor

        // Build the query filter
        const filter = {
            $or: [
                { senderId: currentUserId, receiverId },
                { senderId: receiverId, receiverId: currentUserId }
            ]
        };

        // If a cursor is provided, only get messages older than it
        if (before) {
            const beforeDate = new Date(before);
            if (isNaN(beforeDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid 'before' cursor"
                });
            }
            filter.timestamp = { $lt: beforeDate };
        }

        // Fetch limit+1 to check if more messages exist beyond this page
        const messages = await Message.find(filter)
            .sort({ timestamp: -1 })
            .limit(limit + 1)
            .lean();

        const hasMore = messages.length > limit;

        // Trim to the requested limit and reverse to chronological order
        const trimmed = hasMore ? messages.slice(0, limit) : messages;
        const chronological = trimmed.reverse();

        // The next cursor is the oldest message's timestamp in this batch
        const nextCursor = hasMore && chronological.length > 0
            ? chronological[0].timestamp
            : null;

        return res.status(200).json({
            success: true,
            messages: chronological,
            hasMore,
            nextCursor
        });
    } catch (error) {
        console.error("Error while getting messages: " + error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

