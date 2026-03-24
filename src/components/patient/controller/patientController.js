const Patient = require("../model/patientModel");
const ENUM = require("../../utils/enum");
const appStrings = require("../../utils/appString");
const commonUtils = require("../../utils/commonUtils");
const token = require("../../../middelware/index");
const bcrypt = require("bcrypt");
const redisClient = require("../../utils/redisClient");
const sendVerificationEmail = require("../../utils/emailService");
const config = require("../../../../config/dev.json");


//===================== Patient Registration ==================================//

const patientRegister = async (req, res) => {
    try {
        const { name, email, password, mobileNo, country, countryCode } = req.body;

        const existingPatient = await Patient.findOne({ email, isDeleted: ENUM.IS_DELETED.NOT_DELETED });
        if (existingPatient) {
            return commonUtils.sendErrorResponse(req, res, appStrings.PATIENT_EXIST);
        }

        const emailInUse = await Patient.findOne({ email });
        if (emailInUse) {
            return commonUtils.sendErrorResponse(req, res, appStrings.EMAIL_USE, null, 409);
        }

        const hashpass = await bcrypt.hash(password, 10);
        const patient = new Patient({
            name,
            email,
            password: hashpass,
            mobileNo,
            country,
            countryCode,
        });

     
        let emailOtp;
        if (email) {
            emailOtp = Math.floor(100000 + Math.random() * 900000);
            patient.emailOtp = emailOtp;
            patient.emailOtpExpire = Date.now() + 5 * 60 * 1000; // 5 min
        }

        await patient.save();

    
        if (email) {
            try {
                await sendVerificationEmail(email, emailOtp);
            } catch (e) {
                console.error("Error sending verification email:", e);
            }
        }

        const accessToken = token.generateAccessToken({
            id: patient._id,
            type: "PATIENT",
        });
        const refreshToken = token.generateRefreshToken({
            id: patient._id,
            type: "PATIENT",
        });

        // Store in Redis
        await redisClient.set(`user:access:${patient._id}`, accessToken, { EX: config.REDIS_ACCESS_TOKEN_EXPIRE });
        await redisClient.set(`user:refresh:${patient._id}`, refreshToken, { EX: config.REDIS_REFRESH_TOKEN_EXPIRE });

        // Store in cookies
        commonUtils.storeAcessTokenInCookie(res, "accessToken", accessToken);
        commonUtils.storeRefreshTokenInCookie(res, "refreshToken", refreshToken);

        return commonUtils.sendSuccessResponse(req, res, appStrings.PATIENT_REGISTER, {
            patient: {
                id: patient._id,
                name: patient.name,
                email: patient.email,
                mobileNo: patient.mobileNo,
                country: patient.country,
                countryCode: patient.countryCode,
                emailOtp: patient.emailOtp,
            },
            accessToken,
            refreshToken
        });
    } catch (err) {
        console.log(appStrings.PATIENT_REGISTER_FAILED, err);
        return commonUtils.sendErrorResponse(req, res, appStrings.PATIENT_REGISTER_FAILED, { error: err.message }, 500);
    }
};


//========================== Patient Login ==================================//

const patientLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const patient = await Patient.findOne({ email, isDeleted: ENUM.IS_DELETED.NOT_DELETED });
        if (!patient) {
            return commonUtils.sendErrorResponse(req, res, appStrings.USER_NOT_FOUND);
        }

        const match = await bcrypt.compare(password, patient.password);
        if (!match) {
            return commonUtils.sendErrorResponse(req, res, appStrings.WRONG_PASSWORD);
        }

        if (patient.isEmailVerified === ENUM.ACCOUNT_VERIFIED.NO) {
            return commonUtils.sendErrorResponse(req, res, appStrings.VERIFY_EMAIL_FIRST, null);
        }

        const accessToken = token.generateAccessToken({
            id: patient._id,
            type: "PATIENT",
        });
        const refreshToken = token.generateRefreshToken({
            id: patient._id,
            type: "PATIENT",
        });

        commonUtils.storeAcessTokenInCookie(res, "accessToken", accessToken);
        commonUtils.storeRefreshTokenInCookie(res, "refreshToken", refreshToken);

        // Store in Redis
        await redisClient.set(`user:access:${patient._id}`, accessToken, {
            EX: config.REDIS_ACCESS_TOKEN_EXPIRE,
        });

        return commonUtils.sendSuccessResponse(req, res, appStrings.LOGIN_SUCCESS, {
            patient: {
                id: patient._id,
                name: patient.name,
                email: patient.email,
            },
            accessToken,
            refreshToken,
        });
    } catch (err) {
        console.log(err.message);
        return commonUtils.sendErrorResponse(req, res, err.message);
    }
};


//========================== Verify Email OTP ==================================//

const verifyEmailOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return commonUtils.sendErrorResponse(req, res, appStrings.EMAIL_OTP_REQUIRED);
        }

        const patient = await Patient.findOne({ email });
        if (!patient) {
            return commonUtils.sendErrorResponse(req, res, appStrings.USER_NOT_FOUND);
        }

        if (!patient.emailOtp || patient.emailOtpExpire < Date.now()) {
            return commonUtils.sendErrorResponse(req, res, appStrings.OTP_EXPIRED);
        }

        if (patient.emailOtp !== otp.toString()) {
            return commonUtils.sendErrorResponse(req, res, appStrings.INVALID_OTP);
        }

        patient.isEmailVerified = ENUM.ACCOUNT_VERIFIED.YES;
        patient.emailOtp = null;
        patient.emailOtpExpire = null;
        await patient.save();

        return commonUtils.sendSuccessResponse(req, res, appStrings.EMAIL_VERIFIED);
    } catch (err) {
        console.log(err);
        return commonUtils.sendErrorResponse(req, res, err.message);
    }
};


module.exports = { patientRegister, patientLogin, verifyEmailOtp };
