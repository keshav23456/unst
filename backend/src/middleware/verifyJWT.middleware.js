import jwt from 'jsonwebtoken'
import { User } from '../models/user.model.js'

export const verifyJWT = async (req, res, next) => {

    try {
        const token = req.cookies?.accessToken
            || req.header("Authorization")?.replace("Bearer ", "");

        if(!token) return res.status(401).json({message:"Access token is missing"})

        const decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decoded._id).select("-password -refreshTokens")

        if(!user) throw new Error("Invalid Access Token")

        req.user = user;
        next();
    } catch (error) {
        console.error("JWT Verification Error:", error.message);
        // 401, not 403: a missing/invalid/expired token is an authentication
        // failure ("we don't know who you are"), not an authorization
        // failure. 403 is reserved for ownership/role checks elsewhere.
        return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
    }
}