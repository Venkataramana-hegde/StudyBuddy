import mongoose from "mongoose";
import Group from "./groups.model.js";
import { handleError, response } from "../utils/responseHandler.js";
import { randomInt } from "crypto";


export const createGroup = async (req, res) => {
  const { name, description } = req.body;
  if (!name || !description) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields",
    });
  }
  try {
    let group = await Group.create({
      name,
      description,
      createdBy: req.user._id,
    });
    group = await group.populate("createdBy", "name");
    return res.status(201).json({
      success: true,
      data: group,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const join = async (req, res) => {
  const userId = req.user._id;
  const groupId = req.params.groupId;
  console.log("UserID:", userId);
  if(!mongoose.Types.ObjectId.isValid(groupId)){
    return res.status(400).json({
      success: false,
      message: "Invalid group ID",
    })
  }
  try{
    const updatedGroup = await Group.findOneAndUpdate(
      { _id: groupId, members: { $ne: userId } },
      { $addToSet: { members: userId } },
      { new: true }
    ).populate("members", "name");

    if (!updatedGroup) {
      const existingGroup = await Group.findById(groupId);
      if (!existingGroup) {
        return response(res, false, "Group not found", 404);
      }
      return response(res, false, "Already a member", 400);
    }

    return response(res, true, "Joined successfully", 200, updatedGroup);

  }
  catch(error){
    handleError(res, error);
  }
}

export const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id});
    if(!groups || groups.length === 0){
      return res.status(404).json({
        success: false,
        message: "No groups found",
      })
    }
    const populatedGroups = await Group.find({ members: req.user._id}).populate("members", "name");
    return res.status(200).json({
      success: true,
      data: populatedGroups,
    })
  } catch (error) {
    handleError(res, error);
  }
}

export const getGroupDetails = async (req, res) => {
  const groupId = req.params.groupId;

  // Validate if the groupId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid group ID",
    });
  }

  try {
    // Fetch the group and populate members with their name
    const group = await Group.findById(groupId).populate("members", "name");

    // If the group isn't found
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Successfully found the group
    return res.status(200).json({
      success: true,
      data: group, // Send the full group data (including members)
    });
  } catch (error) {
    console.error("Error fetching group details:", error); // Log error for debugging
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching the group details",
    });
  }
};


export const leaveGroup = async (req, res) => {
  const userId = req.user._id;
  const groupId = req.params.groupId;
  if(!mongoose.Types.ObjectId.isValid(groupId)){
    return res.status(400).json({
      success: false,
      message: "Invalid group ID"
    })
  }
  try {
    const group = await Group.findById(groupId);
    if(!group){
      return res.status(404).json({
        success: false,
        message: "Group not found"
      })
    }
    if(!group.members.includes(userId)){
      return res.status(400).json({
        success: false,
        message: "You are not a member of this group"
      })
    }
    group.members.pull(userId);
    await group.save();
     return res.status(200).json({
       success: true,
       message: "Successfully left the group",
       data: {
         groupId: group._id,
         remainingMembers: group.members.length,
       },
     });
  } catch (error) {
    handleError(res, error);
  }
}

export const deleteGroup = async (req, res) => {
 console.log("Headers:", req.headers); // Check auth header
 console.log("User:", req.user); // Verify user exists

 const groupId = req.params.groupId;
 console.log("Deleting group:", groupId);
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid group ID",
    });
  }
  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }
    if (group.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this group",
      });
    }
    await Group.deleteOne({ _id: groupId });
    return res.status(200).json({
      success: true,
      message: "Group deleted successfully",
    });
  } catch (error) {
    handleError(res, error);
  }
}

export const removeMember = async (req, res) => {
  const groupId = req.params.groupId;
  const targetUserId = req.params.userId; // User to remove (from URL)
  const requesterId = req.user._id; // User making the request (from JWT)

  if (
    !mongoose.Types.ObjectId.isValid(groupId) ||
    !mongoose.Types.ObjectId.isValid(targetUserId)
  ) {
    return response(res, false, "Invalid ID format", 400);
  }

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return response(res, false, "Group not found", 404);
    }

    // Verify requester is group creator
    if (group.createdBy.toString() !== requesterId.toString()) {
      return response(res, false, "Only the creator can remove members", 403);
    }

    // Check if target user is actually in group
    if (!group.members.includes(targetUserId)) {
      return response(
        res,
        false,
        "Target user is not a member of this group",
        400
      );
    }

    // Prevent removing yourself (use leaveGroup instead)
    if (targetUserId === requesterId.toString()) {
      return response(
        res,
        false,
        "Use leave group endpoint instead of removing yourself",
        400
      );
    }

    group.members.pull(targetUserId);
    await group.save();

    return response(res, true, "Member removed successfully", 200, {
      removedUserId: targetUserId,
      remainingMembers: group.members.length,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const updateGroup = async(req, res) => {
  const {name, description} = req.body;
  const groupId = req.params.groupId;
  if(!mongoose.Types.ObjectId.isValid(groupId)){
    return response(res, false, "Invalid group ID", 400);
  }
  try {
    const group = await Group.findById(groupId);
    if(!group){
      return response(res, false, "Group not found", 404);
    }
    if(group.createdBy.toString() !== req.user._id.toString()){
      return response(res, false, "Only the creator can update the group", 403);
    }
    if(!name && !description){
      return response(res, false, "Please provide at least one field to update", 400);
    }
    if(name){
      group.name = name;
    }
    if(description){
      group.description = description;
    }
    await group.save();
    const updatedGroup = await Group.findById(groupId).populate("members", "name");
    return res.status(200).json({
      success: true,
      message: "Group updated successfully",
      data: updatedGroup,
    })

  } catch (error) {
    handleError(res, error);
  }
}

export const listAllGroups = async (req, res) => {
  try{
    const groups = await Group.find({}).populate("members", "name").populate("createdBy", "name");
    if(!groups || groups.length === 0){
      return response(res, false, "No groups found", 404);
    }
    return response(res, true, "Groups fetched successfully", 200, groups);

  }catch(error){
    handleError(res, error);
  }
}

export const inviteMember = async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user._id; // Authenticated user trying to join

  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return response(res, false, "Invalid group ID", 400);
  }

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return response(res, false, "Group not found", 404);
    }

    // Check if already a member
    if (group.members.includes(userId)) {
      return response(
        res,
        false,
        "You are already a member of this group",
        400
      );
    }

    // Add the user to the group
    group.members.addToSet(userId);
    await group.save();

    // Return populated group data
    const updatedGroup = await Group.findById(groupId)
      .populate("members", "name email")
      .populate("createdBy", "name");

    return response(
      res,
      true,
      "Successfully joined the group",
      200,
      updatedGroup
    );
  } catch (error) {
    handleError(res, error);
  }
};


export const searchGroups = async(req, res) => {
  const {query} = req.query;
  if(!query){
    return response(res, false, "Please provide a search query", 400);
  }
  if (!query || query.trim().length < 2) {
    return response(
      res,
      false,
      "Search query must be at least 2 characters",
      400
    );
  }
  try {
    const groups = await Group.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
      members: { $ne: req.user._id },
    })
      .limit(20)
      .select("name description memberCount");
    if(!groups || groups.length === 0){
      return response(res, false, "No groups found", 404);
    }

    return response(res, true, "Search results", 200, groups);
  } catch (error) {
    handleError(res, error);
  }
}

const generateInviteCode = async () => {
  let code;
  let isUnique = false;

  while (!isUnique) {
    code = randomInt(100000, 999999).toString(); // 6-digit number
    const existingGroup = await Group.findOne({ inviteCode: code });
    if (!existingGroup) isUnique = true;
  }

  return code;
};
export const inviteCode = async (req, res) => {
  try {
    const inviteCode = await generateInviteCode();

    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    group.inviteCode = inviteCode; // <-- SAVE it
    await group.save(); // <-- COMMIT the change

    res.status(200).json({ inviteCode });
  } catch (error) {
    res.status(400).json({ error: "Failed to create group" });
  }
};


export const joinGroup = async (req, res) => {
  try {
    const { inviteCode } = req.body;

    // Find group by invite code
    const group = await Group.findOne({ inviteCode });
    if (!group) {
      return res.status(404).json({ error: "Invalid invite code" });
    }

    // Check if user is already a member
    if (group.members.includes(req.user._id)) {
      return res.status(400).json({ error: "Already a member" });
    }

    // Add user to group
    group.members.push(req.user._id);
    await group.save();

    res.json({ message: "Successfully joined group", group });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
