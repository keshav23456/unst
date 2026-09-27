import jwt from 'jsonwebtoken'
import { User } from '../models/user.model.js'
import uploadOnCloudinary from '../utils/cloudinary.js'

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    // No hardcoded `domain` — letting the browser infer it from the request
    // host is what makes this work in both local dev and production without
    // editing code per environment. Set COOKIE_DOMAIN in .env only if you
    // need to share cookies across subdomains.
    ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
};

const generateAccessAndRefreshTokens = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found while generating tokens");

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    // Push, don't overwrite: refreshTokens is an array so multiple devices
    // can each hold their own valid session at the same time.
    user.refreshTokens.push({ token: refreshToken });
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
};

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if ([name, email, password].some((field) => !field || field.trim() === "")) {
            return res.status(400).json({ message: "Please fill all the fields" });
        }

        const existedUser = await User.findOne({ email });
        if (existedUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await User.create({ name, email, password });

        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        user.refreshTokens.push({ token: refreshToken });
        await user.save({ validateBeforeSave: false });

        return res
            .status(201)
            .cookie("accessToken", accessToken, COOKIE_OPTIONS)
            .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
            .json({
                user: { _id: user._id, name: user.name, email: user.email },
                message: "User created successfully",
            });
    } catch (error) {
        console.error("Error while registering user:", error.message);
        return res.status(500).json({ message: error.message || "Registration failed" });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if ([email, password].some((field) => !field || field.trim() === "")) {
            return res.status(400).json({ message: "Please fill all the fields" });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: "Invalid user credentials" });

        const isMatch = await user.isPasswordCorrect(password);
        if (!isMatch) return res.status(401).json({ message: "Invalid user credentials" });

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        const loggedInUser = await User.findById(user._id).select("-password -refreshTokens");

        return res
            .status(200)
            .cookie("accessToken", accessToken, COOKIE_OPTIONS)
            .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
            .json({
                user: loggedInUser,
                message: "User logged in successfully",
            });
    } catch (error) {
        console.error("Error while logging in:", error.message);
        return res.status(500).json({ message: error.message || "Login failed" });
    }
};

export const logoutUser = async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies?.refreshToken;

        // Only remove *this device's* session, not every session the user has.
        await User.findByIdAndUpdate(req.user._id, {
            $pull: { refreshTokens: { token: incomingRefreshToken } },
        });

        return res
            .status(200)
            .clearCookie("accessToken", COOKIE_OPTIONS)
            .clearCookie("refreshToken", COOKIE_OPTIONS)
            .json({ message: "User logged out successfully" });
    } catch (error) {
        console.error("Error while logging out:", error.message);
        return res.status(500).json({ message: "Logout failed" });
    }
};

export const refreshAccessToken = async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

        if (!incomingRefreshToken) {
            return res.status(401).json({ message: "Unauthorized request: no refresh token" });
        }

        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id);
        if (!user) return res.status(401).json({ message: "Invalid refresh token" });

        const matchedSession = user.refreshTokens.find((rt) => rt.token === incomingRefreshToken);
        if (!matchedSession) {
            return res.status(401).json({ message: "Refresh token is expired or has been used" });
        }

        // Rotate: remove the used token, issue a new access+refresh pair.
        user.refreshTokens = user.refreshTokens.filter((rt) => rt.token !== incomingRefreshToken);
        await user.save({ validateBeforeSave: false });

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, COOKIE_OPTIONS)
            .cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS)
            .json({ message: "Access token refreshed" });
    } catch (error) {
        console.error("Error while refreshing access token:", error.message);
        return res.status(401).json({ message: "Invalid or expired refresh token" });
    }
};

export const changeCurrentPassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Please fill all the fields" });
        }

        const user = await User.findById(req.user?._id);
        const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid old password" });
        }

        user.password = newPassword;
        await user.save({ validateBeforeSave: false });

        return res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        console.error("Error while changing password:", error.message);
        return res.status(500).json({ message: "Failed to change password" });
    }
};

export const getCurrentUser = async (req, res) => {
    return res.status(200).json({
        user: req.user,
        message: "Current user fetched successfully",
    });
};

export const updateAccountDetails = async (req, res) => {
    try {
        const { fullName, email } = req.body;
        if (!fullName || !email) {
            return res.status(400).json({ message: "Please fill in all fields" });
        }

        const user = await User.findByIdAndUpdate(
            req.user?._id,
            { $set: { name: fullName, email } }, // was referencing an undefined `name` variable
            { new: true }
        ).select("-password -refreshTokens");

        return res.status(200).json({
            user,
            message: "Account details updated successfully",
        });
    } catch (error) {
        console.error("Error while updating account details:", error.message);
        return res.status(500).json({ message: "Failed to update account details" });
    }
};

export const updateUserAvatar = async (req, res) => {
    try {
        const avatarLocalPath = req.file?.path;
        if (!avatarLocalPath) {
            return res.status(400).json({ message: "Please upload an avatar" });
        }

        const avatar = await uploadOnCloudinary(avatarLocalPath);
        if (!avatar?.url) {
            return res.status(500).json({ message: "Error while uploading avatar" });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: { avatar: avatar.url } },
            { new: true }
        ).select("-password -refreshTokens");

        return res.status(200).json({ user, message: "Avatar updated successfully" });
    } catch (error) {
        console.error("Error while updating avatar:", error.message);
        return res.status(500).json({ message: "Failed to update avatar" });
    }
};
