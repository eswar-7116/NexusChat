import Message from "../../models/Message.js";

export default async function getMessages(req, res) {
    try {
        const { id } = req.params;
        const { newContent } = req.body;

        const updatedMessage = await Message.findOneAndUpdate(
            { _id: id },
            {
                $set: { edited: true, content: newContent },
            },
            { new: true, runValidators: true }
        );

        if (!updatedMessage) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        return res.status(200).json({
            success: true
        });
    } catch (error) {
        console.error("Error while updating message: " + error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}
