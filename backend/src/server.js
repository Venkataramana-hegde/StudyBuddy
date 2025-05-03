import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import dotenv from "dotenv";
import Message from "./services/messages/messages.model.js";

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
// server.js
io.on("connection", (socket) => {
  console.log("New Client Connected: ", socket.id);

  // Join group room when client connects
  // Modified socket.on handler for server.js
  socket.on("joinGroup", (groupId) => {
    socket.join(groupId);
    console.log(`Socket ${socket.id} joined group ${groupId}`);
  });


  socket.on("sendGroupMessage", async (data, callback) => {
    console.log("Received group message data:", data);

    try {
      // Validate data
      if (
        !data ||
        !data.groupId ||
        !data.senderId ||
        (data.message === undefined && data.content === undefined)
      ) {
        console.error("Invalid message data:", data);
        if (callback)
          callback({ success: false, error: "Invalid message data" });
        return;
      }

      const { groupId, senderId, message } = data;
      const messageContent = message || data.content;

      // 1. First save to database
      const newMessage = await Message.create({
        groupId,
        senderId,
        message: messageContent, // Consistent field naming
      });

      // Add a log to see what was created
      console.log("Created new message:", newMessage);

      // 2. Then broadcast to room including the complete message object
      const messageToSend = {
        _id: newMessage._id,
        groupId: newMessage.groupId,
        senderId: newMessage.senderId,
        message: messageContent,
        createdAt: newMessage.createdAt,
      };

      console.log("Broadcasting message to group:", messageToSend);
      io.to(groupId).emit("newGroupMessage", messageToSend);

      // 3. Acknowledge receipt to sender
      if (callback) callback({ success: true, messageId: newMessage._id });
    } catch (error) {
      console.error("Error handling group message:", error);
      if (callback) callback({ success: false, error: error.message });
    }
  });
});
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
