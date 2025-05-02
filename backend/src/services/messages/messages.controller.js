
import { handleError, response } from "../utils/responseHandler.js";

import Message from "./messages.model.js"
import Group from "../groups/groups.model.js"
import User from "../auth/auth.model.js"

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id; // coming from auth middleware
    const { groupId, message } = req.body;

    if (!groupId || !message?.trim()) {
      return response(res, false, "Group ID and message are required", 400);
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return response(res, false, "Group not found", 404);
    }

    if (!group.members.includes(senderId)) {
      return response(res, false, "You are not a member of this group", 403);
    }

    const newMessage = await Message.create({
      groupId,
      senderId,
      message,
    });

    return response(res, true, "Message sent successfully", 200);
  } catch (error) {
    handleError(res, error);
  }
};

export const getGroupMessages = async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const userId = req.user._id;
        const group = await Group.findById(groupId);
        if (!group) return response(res, true, "Group not found", 404);

        if (!group.members.includes(userId)) {
          return response(res, false, "You are not a member of this group", 403);
        }

        const messages = await Message.find({ groupId }).sort({ createdAt: 1 }); 
        return response(res, true, "Messages fetched", 200);
    } catch (error) {
        handleError(res, error);
    }
}
