import express from "express";
import { handleError } from "../utils/responseHandler.js";
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

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    const token = user.getSignedJwtToken();

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", 
      path: "/", 
      maxAge: 30 * 24 * 60 * 60 * 1000, 
    });

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

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", 
      path: "/", 
      maxAge: 30 * 24 * 60 * 60 * 1000, 
    });

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
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
      },
    });
  } catch (error) {
    handleError(res, error);
  }
}

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    // Make sure error has proper status code
    error.status = error.status || 500;
    handleError(res, error);
  }
};
