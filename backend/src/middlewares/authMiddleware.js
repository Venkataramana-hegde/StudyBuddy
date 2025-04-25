import jwt from "jsonwebtoken";
import User from "../services/auth/auth.model.js";

const authenticate = async (req, res, next) => {
  // 1. Get token from multiple sources
  let token;

  // Check if token is in the Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  // Check if token is in the cookies
  else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  // 2. Verify token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Not authorized to access this route - no token provided",
    });
  }

  try {
    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User belonging to this token no longer exists",
      });
    }

    // 5. Attach user to request for access in subsequent routes
    req.user = user;
    next();
  } catch (error) {
    // Handle specific JWT errors
    let errorMessage = "Invalid token";
    if (error.name === "TokenExpiredError") {
      errorMessage = "Token expired";
    } else if (error.name === "JsonWebTokenError") {
      errorMessage = "Invalid token signature";
    }

    return res.status(401).json({
      success: false,
      error: errorMessage,
    });
  }
};

export default authenticate;
