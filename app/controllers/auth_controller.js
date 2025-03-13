import { User } from "../models/user.model.js";
import generateOtp from "../helpers/generate_otp.js";
import sendOtpForValidation from "../../emails/send_otp_for_validation.js";
import sendUserCredential from "../../emails/send_user_cred.js";
import sendResetPasswordRequest from "../../emails/send_reset_password_req.js";
import sendResetPasswordConfirmation from "../../emails/send_reset_password_confirmation.js";
import generateRandomPassword from "../helpers/generate_random_otp.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"; // Fixing the bcrypt import

export const registerUser = async (req, res) => {
    try {
        const { name, email, phone_number } = req.body;
        // Validate required fields
        if (!email) {
            return res
                .status(400)
                .json({ success: false, message: "Email is required" });
        }

        // Check if user already exists
        const existedUser = await User.findOne({ email });
        if (existedUser) {
            return res
                .status(409)
                .json({
                    success: false,
                    message: "Email already exists... please login to continue",
                });
        }

        // Generate OTP for email verification
        const otp = generateOtp();

        // Create user
        const user = await User.create({
            name,
            email,
            isValid: false,
            otp,
            role: "user",
            phone_number,
        });

        const response = await sendOtpForValidation(email, otp);
        if (!response.success) {
            return res
                .status(400)
                .json({
                    message: "Error sending OTP... please retry to continue",
                });
        }
        res.status(201).json({
            success: true,
            id: user._id,
            email,
            message: "OTP sent for verification",
        });
    } catch (err) {
        console.log(err, "error");
        return res
            .status(500)
            .json({
                message: "Something went wrong... please try again later",
            });
    }
};

export const otpVerification = async (req, res) => {
    try {
        const { email, otp } = req.body;
        console.log("OTP Verification:", { email, otp });

        // Validate required fields
        if (!email || !otp) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "Email and OTP are required",
                });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }

        // Check if OTP matches
        if (user.otp != otp) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid OTP" });
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
            return res
                .status(400)
                .json({
                    success: false,
                    message: "Failed to send credentials",
                });
        }

        // Return success response
        return res.status(200).json({
            success: true,
            message: "OTP verified successfully. Check email for credentials.",
        });
    } catch (err) {
        console.error("OTP verification error:", err);
        return res
            .status(500)
            .json({
                success: false,
                message: "Something went wrong... please try again later",
            });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Please enter your credentials to continue" });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res
                .status(400)
                .json({ message: "Please enter a valid credentials" });
        }

        if (!user.isValid) {
            return res
                .status(401)
                .json({
                    message:
                        "Account not verified. Please complete OTP verification.",
                });
        }
        const isPasswordValid = await user.isPasswordCorrect(password);
        if (!isPasswordValid) {
            return res
                .status(401)
                .json({
                    message: "Please enter valid credentials to continue",
                });
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        await User.findOneAndUpdate({ email }, { accessToken, refreshToken });

        res.status(200).json({
            success: true,
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                phone_number: user.phone_number,
                role: user.role
            },
            message: "Login successful",
        });
    } catch (error) {
        console.log(error)
        return res
            .status(500)
            .json({
                message: "Something went wrong... please try again later",
            });
    }
};

export const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate required fields
        if (!email) {
            return res
                .status(400)
                .json({ success: false, message: "Email is required" });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }

        // Check if user account is already verified
        if (user.isValid) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "Account already verified. Please login.",
                });
        }

        // Generate new OTP
        const otp = generateOtp();

        // Update user
        user.otp = otp;
        await user.save();

        // Send OTP email
        const response = await sendOtpForValidation(email, otp);
        if (!response.success) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "Error sending OTP... please retry to continue",
                });
        }

        // Return success response
        return res
            .status(200)
            .json({ success: true, message: "OTP sent for verification" });
    } catch (err) {
        console.error("Resend OTP error:", err);
        return res
            .status(500)
            .json({
                success: false,
                message: "Something went wrong... please try again later",
            });
    }
};

export const forgotPasswordisEmailExist = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate required fields
        if (!email) {
            return res
                .status(400)
                .json({ success: false, message: "Email is required" });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }

        // Check if user account is verified
        if (!user.isValid) {
            return res.status(401).json({
                success: false,
                message:
                    "Account not verified. Please verify your account first.",
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
        return res
            .status(200)
            .json({
                success: true,
                message: "Reset password link sent to your email",
            });
    } catch (err) {
        console.error("Forgot password error:", err);
        return res
            .status(500)
            .json({
                success: false,
                message: "Something went wrong... please try again later",
            });
    }
};


export const resetPassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        const { token } = req.params;
        console.log(newPassword);
        // Validate required fields
        if (!token || !newPassword) {
            return res.status(400).json({ success: false, message: "Token and new password are required" });
        }

        // Find user by reset token
        const user = await User.findOne({ resetToken: token });
        if (!user) {
            return res.status(404).json({ success: false, message: "Invalid or expired token" });
        }


        // Update user password and clear reset token
        user.password = newPassword;
        user.resetToken = undefined;
        await user.save();

        // Return success response
        return res.status(200).json({ success: true, message: "Password reset successfully" });
    } catch (err) {
        console.log(err, 'error')
        return res.status(500).json({ message: 'Something went wrong... please try again later' });
    }
};
export const forgotPassword = async (req, res) => {
    try {
        const { newPassword, confirmPassword, email } = req.body;
        if (!newPassword || !confirmPassword) {
            return res
                .status(400)
                .json({
                    message:
                        "Please add your new password and confirm password",
                });
        }

        if (newPassword !== confirmPassword) {
            return res
                .status(400)
                .json({
                    message: "New password and confirm password dosn't match",
                });
        }

        const user = await User.findOne({ email }).select("-password");
        if (!user) {
            return res
                .status(404)
                .json({ message: "Cannot fetch user details" });
        }

        await User.findOneAndUpdate({ email }, { password: newPassword });

        const response = await sendResetPasswordConfirmation(user.email);

        if (!response.success) {
            return res
                .status(400)
                .json({
                    message: "Problem in sending email.. please try again",
                });
        }
        res.status(200).json({ message: "Your password changed successfully" });
    } catch (err) {
        console.log(err, "error");
        return res
            .status(500)
            .json({
                message: "Something went wrong... please try again later",
            });
    }
};

export const logoutUser = async (req, res) => {
    try {
        // Clear cookies
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        // Return success response
        return res
            .status(200)
            .json({ success: true, message: "Logged out successfully" });
    } catch (err) {
        console.error("Logout error:", err);
        return res
            .status(500)
            .json({
                success: false,
                message: "Something went wrong... please try again later",
            });
    }
};

export const refreshToken = async (req, res) => {
    try {
        const incomingRefreshToken =
            req.cookies.refreshToken || req.body.refreshToken;

        if (!incomingRefreshToken) {
            return res
                .status(401)
                .json({ success: false, message: "Refresh token is required" });
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
                return res
                    .status(404)
                    .json({ success: false, message: "Invalid refresh token" });
            }

            // Check if refresh token matches
            if (user.refreshToken !== incomingRefreshToken) {
                return res
                    .status(401)
                    .json({
                        success: false,
                        message: "Refresh token is expired or used",
                    });
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
                maxAge: 15 * 60 * 1000, // 15 minutes
            });

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            // Return success response
            return res.status(200).json({
                success: true,
                accessToken,
                message: "Access token refreshed successfully",
            });
        } catch (error) {
            return res
                .status(401)
                .json({ success: false, message: "Invalid refresh token" });
        }
    } catch (err) {
        console.error("Refresh token error:", err);
        return res
            .status(500)
            .json({
                success: false,
                message: "Something went wrong... please try again later",
            });
    }
};
