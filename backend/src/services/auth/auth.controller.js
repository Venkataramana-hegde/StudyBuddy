import express from "express";
import { handleError, handleSuccess } from "../utils/responseHandler.js";
import jwt from "jsonwebtoken";

import User from "./auth.model.js";

// auth.controller.js
export const signup = async (req, res) => {
  try {
    // 1. Destructure and validate input
    const { name, email, password } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        error: "Name cannot be empty",
      });
    }

    // 2. Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Email already exists",
      });
    }

    // 3. Create new user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    // 4. Generate token from NEW user
    const token = user.getSignedJwtToken();

    // 5. Return response
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Signup Error:", err);
    handleError(res, err);
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    handleError(res, {
      statusCode: 400,
      message: "Please provide email and password",
    });
  }
  try {
    const existingUser = await User.findOne({ email }).select("+password");
    if (!existingUser) {
      return handleError(res, {
        statusCode: 401,
        message: "Invalid credentials",
      });
    }
    const isMatch = await existingUser.comparePassword(password);
    if (!isMatch) {
      return handleError(res, {
        statusCode: 401,
        message: "Invalid credentials",
      });
    }
    const token = existingUser.getSignedJwtToken();

    return res.status(200).json({
      success: true,
      token,
      existingUser: {
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const currentUser = async(req, res) => {
  try{
    const user = await User.findById(req.user._id);

    if(!user){
      return handleError(res, {
        statusCode: 404,
        message: "User not found"
      })
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      }
    })
  }
  catch(error){
    handleError(res, error);
  }
}
