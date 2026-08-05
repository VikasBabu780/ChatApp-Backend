import jwt from "jsonwebtoken";

/**
 * Generate Access Token
 */
export const generateAccessToken = (user) => {
    return jwt.sign(
        {
            _id: user._id,
            publicId: user.publicId,
            role: user.role,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

/**
 * Generate Refresh Token
 */
export const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            _id: user._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

/**
 * Verify Access Token
 */
export const verifyAccessToken = (token) => {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
};

/**
 * Verify Refresh Token
 */
export const verifyRefreshToken = (token) => {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
};