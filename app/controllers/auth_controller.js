import { User } from "../models/user.model.js";
import generateOtp from "../helpers/generate_otp.js";
import sendOtpForValidation from "../../emails/send_otp_for_validation.js";
import sendUserCredential from "../../emails/send_user_cred.js";
import sendResetPasswordRequest from "../../emails/send_reset_password_req.js";
import sendResetPasswordConfirmation from "../../emails/send_reset_password_confirmation.js";
import generateRandomPassword from "../helpers/generate_random_otp.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"; // Fixing the bcrypt import

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
  try {
    const { email, role, phone_number } = req.body;
    
    // Validate required fields
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    
    // Check if user already exists
    const existedUser = await User.findOne({ email });
    if (existedUser) {
      return res
        .status(409)
        .json({ success: false, message: "Email already exists... please login to continue" });
    }
    
    // Generate OTP for email verification
    const otp = generateOtp();
    
    // Create user
    const user = await User.create({
      email,
      isValid: false,
      otp,
      role: role || "user",
      phone_number
    });

    // Send OTP email
    const response = await sendOtpForValidation(email, otp);
    if (!response.success) {
      return res.status(400).json({ success: false, message: "Error sending OTP... please retry to continue" });
    }
    
    // Return success response
    return res.status(201).json({ 
      success: true,
      data: {
        id: user._id, 
        email
      },
      message: "OTP sent for verification" 
    });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong... please try again later" });
  }
};

/**
 * @desc    Verify OTP and create user account
 * @route   POST /api/v1/auth/otp-verification
 * @access  Public
 */
export const otpVerification = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    // Validate required fields
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    // Check if OTP matches
    if (user.otp !== parseInt(otp)) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
    
    // Generate a random password - DO NOT hash it here, the pre-save hook will hash it
    const password = generateRandomPassword();
    
    // Update user - set as verified and save password
    user.isValid = true;
    user.password = password; // This will be hashed by the pre-save hook
    user.otp = undefined;
    await user.save();
    
    // Send credentials email
    const credentialResponse = await sendUserCredential(email, password);
    if (!credentialResponse.success) {
      return res.status(400).json({ success: false, message: "Failed to send credentials" });
    }
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: "OTP verified successfully. Check email for credentials."
    });
  } catch (err) {
    console.error("OTP verification error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong... please try again later" });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    // Check if user account is verified
    if (!user.isValid) {
      return res.status(401).json({ 
        success: false, 
        message: "Account not verified. Please verify your account first." 
      });
    }
    
    // Add debug logging
    console.log("Login attempt for:", email);
    console.log("Provided password:", password);
    console.log("Stored password hash:", user.password);
    
    // Check if password is correct - use the method from the user model
    const isPasswordValid = await user.isPasswordCorrect(password);
    console.log("isPasswordValid", isPasswordValid);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }
    
    // Generate tokens using user methods
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    
    // Update user with refresh token
    user.refreshToken = refreshToken;
    await user.save();
    
    // Set cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000 // 15 minutes
    });
    
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        avatar: user.avatar
      },
      accessToken,
      message: "Logged in successfully"
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong... please try again later" });
  }
};

/**
 * @desc    Resend OTP for verification
 * @route   POST /api/v1/auth/resend-otp
 * @access  Public
 */
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate required fields
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    // Check if user account is already verified
    if (user.isValid) {
      return res.status(400).json({ success: false, message: "Account already verified. Please login." });
    }
    
    // Generate new OTP
    const otp = generateOtp();
    
    // Update user
    user.otp = otp;
    await user.save();
    
    // Send OTP email
    const response = await sendOtpForValidation(email, otp);
    if (!response.success) {
      return res.status(400).json({ success: false, message: "Error sending OTP... please retry to continue" });
    }
    
    // Return success response
    return res.status(200).json({ success: true, message: "OTP sent for verification" });
  } catch (err) {
    console.error("Resend OTP error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong... please try again later" });
  }
};

/**
 * @desc    Initiate forgot password process
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
export const forgotPasswordisEmailExist = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate required fields
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    // Check if user account is verified
    if (!user.isValid) {
      return res.status(401).json({ 
        success: false, 
        message: "Account not verified. Please verify your account first." 
      });
    }
    
    // Generate reset token
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );
    
    // Update user with reset token
    user.resetToken = resetToken;
    await user.save();
    
    // Send reset password email
    await sendResetPasswordRequest(email, resetToken);
    
    // Return success response
    return res.status(200).json({ success: true, message: "Reset password link sent to your email" });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong... please try again later" });
  }
};

/**
 * @desc    Reset password
 * @route   POST /api/v1/auth/reset-password
 * @access  Private (requires authentication)
 */
export const forgotPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user.id;
    
    // Validate required fields
    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required" });
    }
    
    // Find user by id
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update user
    user.password = hashedPassword;
    user.resetToken = undefined;
    await user.save();
    
    // Send reset password confirmation email
    await sendResetPasswordConfirmation(user.email);
    
    // Return success response
    return res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong... please try again later" });
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private (requires authentication)
 */
export const logoutUser = async (req, res) => {
  try {
    // Clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    
    // Return success response
    return res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong... please try again later" });
  }
};

/**
 * @desc    Refresh access token
 * @route   POST /api/v1/auth/refresh-token
 * @access  Public (requires refresh token)
 */
export const refreshToken = async (req, res) => {
  try {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    
    if (!incomingRefreshToken) {
      return res.status(401).json({ success: false, message: "Refresh token is required" });
    }
    
    try {
      // Verify refresh token
      const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      
      // Find user
      const user = await User.findById(decodedToken._id);
      if (!user) {
        return res.status(404).json({ success: false, message: "Invalid refresh token" });
      }
      
      // Check if refresh token matches
      if (user.refreshToken !== incomingRefreshToken) {
        return res.status(401).json({ success: false, message: "Refresh token is expired or used" });
      }
      
      // Generate new tokens
      const accessToken = jwt.sign(
        { id: user._id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
      );
      const refreshToken = jwt.sign(
        { id: user._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
      );
      
      // Update user with new tokens
      user.accessToken = accessToken;
      user.refreshToken = refreshToken;
      await user.save();
      
      // Set cookies
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 15 * 60 * 1000 // 15 minutes
      });
      
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      // Return success response
      return res.status(200).json({
        success: true,
        accessToken,
        message: "Access token refreshed successfully"
      });
    } catch (error) {
      return res.status(401).json({ success: false, message: "Invalid refresh token" });
    }
  } catch (err) {
    console.error("Refresh token error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong... please try again later" });
  }
};
