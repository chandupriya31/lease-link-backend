import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";

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
                avatar
            },
            { new: true }
        );

        res.status(201).json({ user, message: "profile updated successfully" });
    } catch (err) {
        return res.status(500).json({ message: 'Something went wrong... please try again later' })
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



export const updatePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        console.log(req.user._id);

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Both old and new passwords are required" });
        } // Debugging log

        // Find the user by ID
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if old password matches
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Old password is incorrect" });
        }

       user.password=newPassword;

        await user.save();

        res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
        console.error("Error updating password:", err);
        res.status(500).json({ message: "Something went wrong... please try again later" });
    }
};