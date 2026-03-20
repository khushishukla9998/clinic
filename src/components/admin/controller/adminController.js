

const Admin = require("../model/adminModel");
const token = require("../../../middelware/index")
const ENUM = require("../../utils/enum")
const commonUtils = require("../../utils/commonUtils")
const appStrings = require("../../utils/appString");
const config = require("../../../../config/dev.json");
const redisClient = require("../../utils/redisClient");
const bcrypt = require("bcrypt")

const registerAdmin = async function (req, res) {
  try {

    const { name, email, password, mobileNo, country, countryCode } = req.body;
    // Check if there is already any admin
    const existingAdmin = await Admin.findOne({
      isDeleted: ENUM.IS_DELETED.NOT_DELETED,
    });

    if (existingAdmin) {
      return commonUtils.sendErrorResponse(
        req,
        res,
        appStrings.ADMIN_EXIST,
        null,
        409,
      );
    }

    //prevent duplicate email 
    const emailInUse = await Admin.findOne({ email });
    if (emailInUse) {
      return commonUtils.sendErrorResponse(
        req,
        res,
        appStrings.EMAIL_USE,
        null,
        409,
      );
    }

    //  Hash password
    const hashpass = await bcrypt.hash(password, 10);
    //Create admin
    const admin = new Admin({
      name,
      email,
      password: hashpass,
      mobileNo,
      country,
      countryCode
    });

    await admin.save();

    const accessToken = token.generateAccessToken({
      id: admin._id,
      type: "ADMIN",
    });
    const refreshToken = token.generateRefreshToken({
      id: admin._id,
      type: "ADMIN",
    });


    // Store Admin Token in Redis
    await redisClient.set(`user:access:${admin._id}`, accessToken, { EX: 600 });
    await redisClient.set(`user:refresh:${admin._id}`, refreshToken, { EX: 604800 });


    commonUtils.storeAcessTokenInCookie(res, "accessToken", accessToken);
    commonUtils.storeRefreshTokenInCookie(res, "refreshToken", refreshToken);

    return commonUtils.sendSuccessResponse(
      req,
      res,
      appStrings.REGISTRATION_SUCCESS,
      {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          mobileNo: admin.mobileNo,
          country: admin.country,
          countryCode: admin.countryCode,
          status: ENUM.STATUS.ACTIVE,
        },
        accessToken,
        refreshToken,
      },
    );
  } catch (err) {
    console.log(appStrings.REGISTRATION_ERROR, err);
    return commonUtils.sendErrorResponse(
      req,
      res,
      appStrings.REGISTRATION_FAILED,
      { error: err.message },
      500,
    );
  }
};


//==========================admin login============================//

const adminLogin = async function (req, res) {
  try {
    const { email, password } = req.body;


    const admin = await Admin.findOne({
      email,
      isDeleted: ENUM.IS_DELETED.NOT_DELETED,
    });

    if (!admin) {
      return commonUtils.sendErrorResponse(req, res, appStrings.USER_NOT_FOUND);
    }

    const match = await bcrypt.compare(password, admin.password);

    if (!match) {
      return commonUtils.sendErrorResponse(req, res, appStrings.WRONG_PASSWORD);
    }

    const accessToken = token.generateAccessToken({
      id: admin._id,
      type: "ADMIN",
    });
    const refreshToken = token.generateRefreshToken({
      id: admin._id,
      type: "ADMIN",
    });

    commonUtils.storeAcessTokenInCookie(res, "accessToken", accessToken);
    commonUtils.storeRefreshTokenInCookie(res, "refreshToken", refreshToken);

    // Store Admin Token in Redis
    await redisClient.set(`user:access:${admin._id}`, accessToken, {
      EX: config.REDIS_ACCESS_TOKEN_EXPIRE,
    });

    return commonUtils.sendSuccessResponse(req, res, appStrings.LOGIN_SUCCESS, {
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        status: ENUM.STATUS.ACTIVE,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    return commonUtils.sendErrorResponse(
      req,
      res,
      appStrings.LOGIN_FAILED,
      { error: err.message },
      500,
    );
  }
};

module.exports = { adminLogin, registerAdmin }