import mongoose from "mongoose";
import { User } from "../models/user.model.js";

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

export const getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }).select("-password -refreshToken -otp");
        res.status(200).json(users);
    } catch (err) {
        return res.status(500).json({ message: 'Something went wrong... please try again later' });
    }
}

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params
        const { status } = req.body
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }
        const user = await User.findByIdAndUpdate(id, { $set: { status } }, { new: true });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ user, message: "User status successfully" })
    } catch (err) {
        return res.status(500).json({ message: 'Something went wrong... please try again later' });
    }
}