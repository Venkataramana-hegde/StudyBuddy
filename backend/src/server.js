import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// SOCKET LOGIC STARTS
io.on("connection", (socket) => {
  console.log("New Client Connected: ", socket.id);

  socket.on("joinGroup", (groupId) => {
    socket.join(groupId);
    console.log(`User joined group: ${groupId}`);
  });

  socket.on("sendGroupMessage", (data) => {
    const { groupId, senderId, message } = data;

    io.to(groupId).emit("newGroupMessage", {
      groupId,
      senderId,
      message,
      createdAt: new Date(),
    });
  });
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
