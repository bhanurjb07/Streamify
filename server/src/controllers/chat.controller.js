import User from "../models/User.js";
import { generateStreamToken, upsertStreamUser } from "../lib/stream.js";

export async function getStreamToken(req, res) {
  try {
    const user = req.user;

    await upsertStreamUser({
      id: user._id.toString(),
      name: user.fullName,
      image: user.profilePic || "",
    });

    const token = generateStreamToken(user.id);

    res.status(200).json({ token });
  } catch (error) {
    console.log("Error in getStreamToken controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function syncChatUsers(req, res) {
  try {
    const myUser = req.user;
    const { id: targetUserId } = req.params;

    const targetUser = await User.findById(targetUserId).select("fullName profilePic");
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    await upsertStreamUser({
      id: myUser._id.toString(),
      name: myUser.fullName,
      image: myUser.profilePic || "",
    });

    await upsertStreamUser({
      id: targetUser._id.toString(),
      name: targetUser.fullName,
      image: targetUser.profilePic || "",
    });

    res.status(200).json({
      success: true,
      targetUser: {
        _id: targetUser._id,
        fullName: targetUser.fullName,
        profilePic: targetUser.profilePic,
      },
    });
  } catch (error) {
    console.log("Error in syncChatUsers controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
