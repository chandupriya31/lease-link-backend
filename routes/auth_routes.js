import express from "express";
import { forgotPassword, isEmailExist, loginUser, otpVerification, registerUser, resendOtp } from "../app/controllers/auth_controller.js";
import { authenticateUser } from "../app/middlewares/auth_middlewares.js";

const router = express.Router();

router.post('/register', registerUser);
router.post("/login", loginUser);

router.post("/otp", otpVerification);

router.post("/is-email-exist", isEmailExist);

router.post("/re-send-otp", resendOtp);

router.post("/forgot-password", forgotPassword);

export default router;