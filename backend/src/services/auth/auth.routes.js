import { Router } from "express";
import { signup, login, currentUser, logout } from "./auth.controller.js";
import authenticate from "../../middlewares/authMiddleware.js";

const router = Router();

router.post('/signup', signup);
router.post("/login", login);
router.get("/current-user", authenticate, currentUser);
router.post("/logout", (req, res, next) => {
  // Ensure Express knows we want JSON
  res.setHeader("Content-Type", "application/json");
  logout(req, res).catch(next);
});
export default router;