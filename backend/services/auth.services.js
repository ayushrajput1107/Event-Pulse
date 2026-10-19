const User = require("../models/user.model.js");
const ApiError = require("../utils/ApiError.js");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");

const {
    generateAccessToken,
    generateRefreshToken,
} = require("../utils/token.util.js");


class AuthService {


    async getCurrentUser(userId) {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found.");
        }
        return user;
    }


    async register(userData) {
        const {
            firstName,
            lastName,
            email,
            password,
        } = userData;

        const existingUser = await User.findOne({
            "auth.email": email,
        });

        if (existingUser) {
            throw new ApiError(409, "Email already registered.");
        }

        const user = await User.create({
            profile: {
                firstName,
                lastName,
            },
            auth: {
                email,
                password,
            },
        });

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

        user.refreshToken = hashedRefreshToken;
        user.refreshTokenExpiresAt = new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
        );

        await user.save();

        const userResponse = user.toJSON();
        delete userResponse.auth.password;
        // delete userResponse.refreshToken;

        return {
            user: userResponse,
            accessToken,
            refreshToken,
        };
    }


    async login(email, password) {
        const user = await User.findOne({
            "auth.email": email,
        }).select("+auth.password +refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid Credentials.");
        }

        const isPasswordCorrect = await user.comparePassword(password);

        if (!isPasswordCorrect) {
            throw new ApiError(401, "Invalid Credentials.");
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

        user.refreshToken = hashedRefreshToken;
        user.refreshTokenExpiresAt = new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
        );

        user.loginCount += 1;
        user.lastSeen = new Date();
        user.auth.lastLogin = new Date();


        await user.save();

        const userResponse = user.toObject();
        delete userResponse.auth.password;
        delete userResponse.refreshToken;
        delete userResponse.refreshTokenExpiresAt;


        return {
            user: userResponse,
            accessToken,
            refreshToken,
        };
    }


    async refreshToken(refreshToken) {
        if (!refreshToken) {
            throw new ApiError(401, "Refresh Token missing.");
        }

        let decoded;
        try {
            decoded = jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET
            );
        } catch {
            throw new ApiError(401, "Invalid or expired refresh token.");
        }

        const user = await User.findById(decoded.id).select("+refreshToken");
        if (!user) throw new ApiError(401, "User not found.");

        const isValid = await bcrypt.compare(refreshToken, user.refreshToken);

        if (!isValid) throw new ApiError(401, "Invalid Refresh Token. ");

        const newAccesssToken = generateAccessToken(user);
        const newRefreshtoken = generateRefreshToken(user);

        const hashedRefreshToken = await bcrypt.hash(newRefreshtoken, 10);
        user.refreshToken = hashedRefreshToken;

        user.refreshTokenExpiresAt = new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
        );

        await user.save();

        return {
            accessToken: newAccesssToken,
            refreshToken: newRefreshtoken,
        };

    }


    async logout(refreshToken) {
        if (!refreshToken) return;
        let decoded;
        try {
            decoded = jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET
            );
        } catch {
            return;
        }


        const user = await User.findById(decoded.id);

        if (!user) return;
        user.refreshToken = null;
        user.refreshTokenExpiresAt = null;

        await user.save();
    }


    async changePassword(userId, currentPassword, newPassword) {
        if (!currentPassword || !newPassword) {
            throw new ApiError(400, "Current and new password is required");
        }

        if (newPassword.length < 8) {
            throw new ApiError(400, "New Password must atleast 8 characters long");
        }

        const user = await User.findById(userId).select("+auth.password +refreshToken +refreshTokenExpiresAt");

        if (!user) {
            throw new ApiError(404, "User not Found.");
        }
        const isPasswordCorrect = await user.comparePassword(currentPassword);

        if (!isPasswordCorrect) {
            throw new ApiError(401, "Current Password is incorrect");
        }

        const isSamePassword = await user.comparePassword(newPassword);

        if (isSamePassword) {
            throw new ApiError(400, "New Password must be different from the same password.");
        }

        user.auth.password = newPassword;

        user.refreshToken = null;
        user.refreshTokenExpiresAt = null;

        await user.save();

        return true;
    }


    async getAllUsers() {
        const users = await User.find().select("-auth.password -refreshToken -refreshTokenExpiresAt").sort({ createdAt: -1 });
        return users;
    }


    async suspendUser(adminId, userId, reason = "") {

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new ApiError(400, "Invalid user ID.");
        }

        if (adminId.toString() === userId.toString()) {
            throw new ApiError(400, "Admin cannot suspend their own account");
        }

        const user = await User.findById(userId).select("+refreshToken +refreshTokenExpiresAt");

        if (!user) throw new ApiError(404, "User not found!");

        if (user.authorization.role === "ADMIN") {
            throw new ApiError(403, "Admin accounts cannot be suspended.");
        }

        user.account.status = "SUSPENDED";
        user.account.suspensionReason = reason;
        user.account.suspendedUntil = null;

        user.refreshToken = null;
        user.refreshTokenExpiresAt = null;

        await user.save();

        return user;
    }

    async activateUser(userId) {
        if (!mongoose.Types.ObjectId.isValid(userId)) throw new ApiError(400, "Invalid user Id.");

        const user = await User.findById(userId);
        if (!user) throw new ApiError(404, "User not found.");

        if (user.account.status === "ACTIVE") {
            throw new ApiError(400, "USer account is already Active!");
        };

        user.account.status = "ACTIVE";
        user.account.suspensionReason = "";
        user.account.suspendedUntil = null;

        await user.save();

        return user;
    }




}

module.exports = new AuthService();