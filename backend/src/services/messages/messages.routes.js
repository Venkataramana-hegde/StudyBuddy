import { Router } from "express";
import authenticate from "../../middlewares/authMiddleware.js";
import { sendMessage, getGroupMessages } from "./messages.controller.js";

const router = Router();

router.post("/:groupId/send",authenticate, sendMessage);
router.get("/:groupId/messages", authenticate, getGroupMessages);

export default router;