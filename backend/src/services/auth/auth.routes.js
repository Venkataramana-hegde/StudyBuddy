import { Router } from "express";
import { signup, login, currentUser } from "./auth.controller.js";
import authenticate from "../../middlewares/authMiddleware.js";

const router = Router();

router.post('/signup', signup);
router.post("/login", login);
router.get("/current-user", authenticate, currentUser)

export default router;