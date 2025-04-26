import mongoose from "mongoose";
import Group from "./groups.model.js";
import { handleError } from "../utils/responseHandler.js";

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
