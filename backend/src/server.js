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

// Make io available to the express app for use in controllers
app.set("io", io);

// SOCKET LOGIC STARTS
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinGroup", (groupId) => {
    socket.join(groupId);
    console.log(`User joined group room: ${groupId}`);
  });

  socket.on("sendGroupMessage", async (messageData, callback) => {
    try {
      // Your existing code to save the message to MongoDB
      const { groupId, senderId, message } = messageData;

      // Save message to MongoDB (your existing code)
      const newMessage = new Message({
        groupId,
        senderId,
        message,
      });

      await newMessage.save();

      // Broadcast to all clients in the group including sender
      io.to(groupId).emit("newGroupMessage", {
        _id: newMessage._id,
        senderId,
        message,
        createdAt: newMessage.createdAt,
      });

      // Send acknowledgement with message ID back to sender
      if (typeof callback === "function") {
        callback({ success: true, _id: newMessage._id });
      }
    } catch (error) {
      console.error("Error sending group message:", error);
      if (typeof callback === "function") {
        callback({ success: false, error: error.message });
      }
    }
  });

  // Group update event handler
  socket.on("updateGroup", async (data) => {
    try {
      const { groupId, name, description } = data;

      // Broadcast the update to all users in the group
      io.to(groupId).emit("groupUpdated", {
        groupId,
        name,
        description,
      });

      console.log(`Group ${groupId} updated and broadcast to members`);
    } catch (error) {
      console.error("Error updating group via socket:", error);
    }
  });

  // Group deletion event handler
  socket.on("deleteGroup", async (data) => {
    try {
      const { groupId } = data;

      // Broadcast deletion to all members with clear message and redirect instruction
      io.to(groupId).emit("groupDeleted", {
        groupId,
        message: "Group has been deleted by the admin",
        redirectTo: "/",
      });

      console.log(`Group ${groupId} deletion broadcast to members`);
    } catch (error) {
      console.error("Error handling group deletion via socket:", error);
    }
  });

  // Disconnection handler
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
