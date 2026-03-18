const jwt = require("jsonwebtoken");
const commonUtils = require("../components/utils/commonUtils");
const appStrings = require("../components/utils/appString");
const config = require("../../config/dev.json");
const redisClient = require("../components/utils/redisClient");
// const User = require("../components/user/model/userModel");
const ENUM = require("../components/utils/enum");
const appString = require("../components/utils/appString");


// access token 
function generateAccessToken(payload) {
    return jwt.sign(payload, config.ACCESS_TOKEN_SECRET, {
        expiresIn: config.ACCESS_TOKEN_TIME,
    });
}

// Refresh token
function generateRefreshToken(payload) {
    return jwt.sign(payload, config.REFRESH_TOKEN_SECRET, {
        expiresIn: config.REFRESH_TOKEN_TIME,
    });
}


// verify accessToken

async function verifyAcessToken(req, res, next) {
    try {
        console.log("verify acess token  ")
        let token = req.headers.authorization?.split(' ')[1] || req?.cookies.accessToken;
        console.log(token);
        if (!token) {
            return commonUtils.sendErrorResponse(req, res, appStrings.TOKEN_NOT_PROVIDED, null, 401);
        }
     console.log("decode");
    
        const decode = jwt.verify(token, config.ACCESS_TOKEN_SECRET);
        console.log('decode:', decode);
        req.accessToken = token;
        req.refreshToken = req.cookies?.refreshToken
        req.userId = decode.id || decode.userId;
        req.adminId = decode.id||decode.admimId;
        req.type = decode.type;
        req.headers = decode;
        console.log(decode);

        // Check if token exists in Redis for this user
        const redisKey = `user:access:${decode.id}`;
        const tokenInRedis = await redisClient.get(redisKey);

        if (!tokenInRedis || tokenInRedis !== token) {
            return commonUtils.sendErrorResponse(req, res, appStrings.INVALID_TOKEN_IN_REDISH, null, 401);
        }
        // Check if user is banned (only for non-admin users)
        // if (decode.type !== "ADMIN") {
        //     const user = await User.findById(decode.id || decode.userId);
        //     if (user && user.status === ENUM.USER_STATUS.BANNED) {
        //         return commonUtils.sendErrorResponse(req, res, appString.ACCOUNT_BANNED, null, 403);
        //     }
        // }

        next();

    } catch (err) {
        console.error("Token verification error:", err.message);
        if (err.name === 'TokenExpiredError') {
            return commonUtils.sendErrorResponse(req, res, appStrings.TOKEN_EXPIRED, null, 401);
        } else if (err.name === 'JsonWebTokenError') {

            return commonUtils.sendErrorResponse(req, res, appStrings.INVALID_TOKEN, null, 401);
        } else {

            return commonUtils.sendErrorResponse(req, res, appStrings.SERVER_ERROR || 'Internal Server Error', null, 500);
        }
    }
}

// verify refresh token
function verifyRefreshToken(token) {
    return jwt.verify(token, config.REFRESH_TOKEN_SECRET);
}

// isAdmin middleware
// async function isAdmin(req, res, next) {
//     if (req.type === "ADMIN") {
//         next();
//     } else {
//         return commonUtils.sendErrorResponse(req, res,appString.ACCESS_DENIED, null, 403);
//     }
// }

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAcessToken,
    verifyRefreshToken,
    // isAdmin
};
