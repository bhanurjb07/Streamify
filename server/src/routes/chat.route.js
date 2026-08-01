import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getStreamToken, syncChatUsers } from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/token", protectRoute, getStreamToken);
router.post("/sync/:id", protectRoute, syncChatUsers);

export default router;
