import express from "express";
import { forgotPassword, getUserProfile, isEmailExist, loginUser, otpVerification, profileUpdate, registerUser, resendOtp } from "../app/controllers/auth_controller.js";
import { authenticateUser } from "../app/middlewares/auth_middlewares.js";

const router = express.Router();

router.post('/register', registerUser);
router.post("/login", loginUser);

router.post("/otp", otpVerification);

router.post("/isEmailExist", authenticateUser, isEmailExist);

router.post("/re-sendOtp", authenticateUser, resendOtp);

router.put("/profileUpdate", authenticateUser, profileUpdate);

router.post("/forgot-password", authenticateUser, forgotPassword);

router.get("/profile", authenticateUser, getUserProfile);

export default router;