import { Router } from "express";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./services/auth/auth.routes.js";
import groupRoutes from "./services/groups/groups.routes.js";
import messageRoutes from "./services/messages/messages.routes.js"

import dotenv from "dotenv";
dotenv.config();

const router = Router();

//START OF AGORA
import pkg from "agora-access-token";
const { RtcTokenBuilder, RtcRole } = pkg;

const APP_ID = process.env.AGORA_APP_ID;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

router.post("/generate-token", (req, res) => {
  const { channelName, uid } = req.body;

  if (!channelName || !uid) {
    return res.status(400).json({ error: "channelName and uid are required" });
  }

  const role = RtcRole.PUBLISHER;
  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid,
    role,
    privilegeExpiredTs
  );

  res.json({ token });
});
//END OF AGORA


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
