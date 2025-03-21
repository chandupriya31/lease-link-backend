import express from "express";
import {
  forgotPasswordisEmailExist,
  loginUser,
  otpVerification,
  registerUser,
  resendOtp,
  resetPassword,
  logoutUser,
  refreshToken
} from "../app/controllers/auth_controller.js";
import { authenticateUser } from "../app/middlewares/auth_middlewares.js";

const router = express.Router();


// Public routes updated 
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/otp-verification", otpVerification);
router.post("/forgot-password", forgotPasswordisEmailExist);
router.post("/resend-otp", resendOtp);
router.post("/refresh-token", refreshToken);


router.post("/reset-password/:token", resetPassword);

router.post("/logout", authenticateUser, logoutUser);

export default router;

