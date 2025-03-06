import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";

const userSchema = new Schema(
    {
        name: String,
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        phone_number: String,
        avatar: {
            type: String,
            default:
                "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
        },
        password: String,
        role: {
            type: String,
            enum: ["admin", "user"],
            required: true,
            default: "user",
        },
        refreshToken: {
            type: String,
            default: null,
        },
        accessToken: {
            type: String,
            default: null,
        },
        otp: {
            type: Number,
            default: null,
            expiredAt: Date.now() + 10 * 60,
        },
        isValid: {
            type: Boolean,

            default: false,
        },
        status: {
            type: String,
            enum: ['active', 'blocked'],
            default: 'active'
        }
    }, { timestamps: true });

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcryptjs.hash(this.password, 10);
    next();
});

userSchema.pre(["findOneAndUpdate", "findByIdAndUpdate"], async function (next) {
    let update = this.getUpdate();
    if (update.password) {
        update.password = await bcryptjs.hash(update.password, 10);
    }
    next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcryptjs.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            role: this.role,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

export const User = mongoose.model("User", userSchema);
