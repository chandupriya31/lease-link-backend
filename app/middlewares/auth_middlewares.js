import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

/**
 * @desc    Authenticate user and check if token is valid
 * @middleware
 */
export const authenticateUser = async (req, res, next) => {
  try {
    // Get token from cookies or headers
    let token = "";
    const authHeader = req.headers.authorization || req.headers.Authorization;
    
    if (req.cookies && req.cookies.accessToken) {
      // Get from cookie
      token = req.cookies.accessToken;
    } else if (authHeader && authHeader.startsWith("Bearer ")) {
      // Get from Authorization header
      token = authHeader.split(" ")[1];
    } else if (req.headers.accesstoken) {
      // Get from custom header
      token = req.headers.accesstoken;
    }

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Access denied. No token provided." 
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      
      // Get user from database
      const user = await User.findById(decoded._id || decoded.id).select("-password");
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: "User not found or token is invalid" 
        });
      }
      
      // Check if user is blocked
      if (user.status === 'blocked') {
        return res.status(403).json({ 
          success: false, 
          message: "Your account has been blocked. Please contact admin." 
        });
      }
      
      // Set user in request
      req.user = user;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ 
          success: false, 
          message: "Token expired. Please login again." 
        });
      }
      
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token. Please login again." 
      });
    }
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Something went wrong with authentication. Please try again." 
    });
  }
};

/**
 * @desc    Check if user is admin
 * @middleware
 */
export const isAuthorizedUser = (req, res, next) => {
  try {
    // Check if user exists in request (set by authenticateUser)
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: "User not authenticated" 
      });
    }
    
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized. Admin access required." 
      });
    }
    
    next();
  } catch (error) {
    console.error("Authorization error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Something went wrong with authorization. Please try again." 
    });
  }
};
