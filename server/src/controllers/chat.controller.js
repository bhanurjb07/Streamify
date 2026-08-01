import Message from "../models/Message.js";
import logger from "../utils/logger.js";
export async function getMessages(req, res) {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: userId },
        { sender: userId, recipient: currentUserId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "fullName profilePic");

    res.status(200).json(messages);
  } catch (error) {
    logger.error("Error in getMessages controller", { message: error.message });
    res.status(500).json({ message: "Internal Server Error" });
  }
}
