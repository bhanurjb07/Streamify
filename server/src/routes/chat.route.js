import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages } from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/messages/:userId", protectRoute, getMessages);

export default router;
