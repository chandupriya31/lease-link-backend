import { User } from "../models/user.model.js";
import sendOtpForValidation from '../../emails/send_otp_for_validation.js';
import sendUserCredential from '../../emails/send_user_cred.js';
import sendResetPasswordRequest from '../../emails/send_reset_password_req.js';
import sendResetPasswordConfirmation from '../../emails/send_reset_password_confirmation.js';
import generateRandomPassword from '../helpers/generate_random_otp.js';

export const registerUser = async (req, res) => {
    try {
        const { email, role, phone_number } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        const existedUser = await User.findOne({ email });
        if (existedUser) {
            return res.status(409).json({ message: 'Email already exists... please login to continue' });
        }
        const otp = generateOtp();
        const user = await User.create({
            email,
            isValid: false,
            otp,
            role,
            phone_number
        });

        const response = await sendOtpForValidation(email, otp);
        if (!response.success) {
            return res.status(400).json({ message: 'Error sending OTP... please retry to continue' });
        }
        res.status(201).json(new { id: user._id, email, message: "OTP sent for verification" });
    } catch (err) {
        return res.status(500).json({ message: 'Something went wrong... please try again later' });
    }
};


export const otpVerification = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'Cannot find the user.. please register to continue' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Please enter a valid OTP' })
        };

        const password = generateRandomPassword();
        user.isValid = true;
        user.password = password;
        await user.save();

        const result = await sendUserCredential(email, password);
        if (!result.success)
            return res.status(400).json({ message: "Failed to send credentials" });

        res.status(200).json({ message: "OTP verified successfully. Check email for credentials." });
    } catch (err) {
        return res.status(500).json({ message: 'Something went wrong... please try again later' });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please enter your credentials to continue' })
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Please enter a valid credentials' })
        }

        if (!user.isValid) {
            return res.status(401).json({ message: "Account not verified. Please complete OTP verification." });
        }
        const isPasswordValid = await user.isPasswordCorrect(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Please enter valid credentials to continue" });
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        await User.findOneAndUpdate({ email }, { accessToken, refreshToken });

        res.cookie("accessToken", accessToken)
            .cookie("refreshToken", refreshToken)
            .status(200)
            .json({ id: user._id, email, message: "Login successful" });
    } catch (error) {
        return res.status(500).json({ message: 'Something went wrong... please try again later' })
    }
};

export const profileUpdate = async (req, res) => {
    const { phone_number, fullName, avatar, dateOfBirth } = req.body;
    if (!phone_number || !fullName || !avatar || !dateOfBirth) {
        return res.status(400).json({ message: 'Please enter the details to continue' });
    }
    try {
        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                phone_number,
                name: fullName,
                avatar,
                dateOfBirth,
            },
            { new: true }
        );

        res.status(201).json({ user, message: "profile updated successfully" });
    } catch (err) {
        return res.status(500).json({ message: 'Something went wrong... please try again later' })
    }
};

export const isEmailExist = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email must be required" });
        }

        const checkMail = await User.findOne({ email }).select("-password");
        if (!checkMail) {
            return res.status(400).json({ message: 'Cannot fetch details... please try again' })
        }

        const response = await sendResetPasswordRequest(email);

        if (!response.success) {
            return res.status(400).json({ message: "Forgot password mail not send " });
        }

        res.status(200).json({ message: "Forgot password link send Successfully" });
    } catch (err) {
        return res.status(500).json({ message: 'Something went wrong... please try again later' });
    }
};

export const resendOtp = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) {
            return res.statu(404).json({ message: 'Cannot get user details... Please register to continue' });
        }
        const otp = generateOtp();
        await User.findByIdAndUpdate(req.user._id, { otp });
        const response = await sendOtpForValidation(user.email, { otp });
        if (!response.success) {
            return res.status(400).json({ message: 'otp send successfully... please check your registered ' });
        }
        res.status(201).json({ message: "otp send successfully" });
    } catch (err) {
        return res.status(500).json({ message: 'Something went wrong... please try again later' });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { newPassword, confirmPassword } = req.body;
        if (!newPassword || !confirmPassword) {
            return res.status(400).json({ message: 'Please add your new password and confirm password' });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "New password and confirm password dosn't match" });
        }

        const user = await User.findById(req.user._id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "Cannot fetch user details" });
        }

        await User.findByIdAndUpdate(req.user._id, { password: newPassword });

        const response = await sendResetPasswordConfirmation(user.email);

        if (!response.success) {
            return res.status(400).json({ message: "Problem in sending email.. please try again" });
        }
        res.status(200).json({ message: "Your password changed  successfully" });
    } catch (err) {
        return res.status(500).json({ message: 'Something went wrong... please try again later' });
    }
};


export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password -refreshToken -otp");
        res.json(user);
    } catch (err) {
        return res.status(500).json({ message: 'Something went wrong... please try again later' });
    }
};