import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      maxlength: [50, "Name cannot be more than 50 characters"],
      trim: true,
      validate: {
        validator: function (v) {
          console.log("Name validation:", v); // Debug log
          return v && v.trim().length > 0;
        },
        message: "Name cannot be empty",
      },
    },
    email: {
      type: String,
      required: [true, "Please add an email"], // Added proper error message
      unique: true,
      trim: true,
      lowercase: true, // Ensure consistent email casing
    },
    password: {
      type: String,
      required: [true, "Please add a password"], // Fixed missing error message
      minlength: [6, "Password must be at least 6 characters"], // Increased minimum length
      select: false, // Don't return password in queries
    },
  },
  { timestamps: true }
); // Added timestamps for created/updated fields

userSchema.pre("save", async function (next) {
  // Only hash password if it's modified (or new)
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token method
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
};

const User = mongoose.model("User", userSchema);

export default User;
