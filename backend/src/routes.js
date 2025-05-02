import { Router } from "express";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./services/auth/auth.routes.js";
import groupRoutes from "./services/groups/groups.routes.js";
import messageRoutes from "./services/messages/messages.routes.js"

const router = Router();

router.use(helmet());
router.use(morgan("combined"));

router.use((req, res, next) => {
  if (req.method === "POST" || req.method === "PUT") {
    if (!req.is("application/json")) {
      return res.status("Content type must be application/json");
    }
  }
  next();
});

router.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to StudyBuddy API"});
})

router.use("/api/auth", authRoutes);
router.use("/api/group", groupRoutes);
router.use("/api/message", messageRoutes);

router.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

export default router;
