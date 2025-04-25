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

    // In both login and signup success handlers:
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Changed from 'lax' to 'strict'
      path: "/", // Accessible across all routes
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

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

    // In both login and signup success handlers:
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", 
      path: "/", // Accessible across all routes
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
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
    // Middleware already attached user to req
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
