const Doctor = require("../model/doctorModel");
const ENUM = require("../../utils/enum");
const appStrings = require("../../utils/appString");
const commonUtils = require("../../utils/commonUtils");
const token = require("../../../middelware/index");
const bcrypt = require("bcrypt");
const redisClient = require("../../utils/redisClient");
const sendVerificationEmail = require("../../utils/emailService");
const config = require("../../../../config/dev.json")
const Wallet = require("../model/walletModal");
const Settings = require("../../admin/model/settingModel");


//=====================Registration==================================//

const doctorRegister = async (req, res) => {

    try {
        const { name, email, password, mobileNo, country, countryCode, appointmentsCharges } = req.body;
        const doctor = await Doctor.findOne({ email, isDeleted: ENUM.IS_DELETED.NOT_DELETED, });
        console.log(doctor)
        if (doctor) {
            return commonUtils.sendErrorResponse(req, res, appStrings.DOCTOR_EXIST)
        }
        const emailInUse = await Doctor.findOne({ email });
        if (emailInUse) {
            return commonUtils.sendErrorResponse(
                req,
                res,
                appStrings.EMAIL_USE,
                null,
                409,
            );
        }
        const hashpass = await bcrypt.hash(password, 10);
        const doc = new Doctor({
            name,
            email,
            password: hashpass,
            mobileNo,
            country,
            countryCode,
            appointmentsCharges
        });

        doc.save();

        // create email otp
        let emailOtp;
        if (email) {
            emailOtp = Math.floor(100000 + Math.random() * 900000);
            doc.emailOtp = emailOtp;
            doc.emailOtpExpire = Date.now() + 5 * 60 * 1000; // 5 min
        }
        if (email) {
            try {
                await sendVerificationEmail(email, emailOtp);
            } catch (e) {
                console.error("Error sennding verificatio email:", e);
            }
        }
        // generate Access Token
        const accessToken = token.generateAccessToken({
            id: doc._id,
            type: "DOCTOR",
        });
        // generate Refresh Token
        const refreshToken = token.generateRefreshToken({
            id: doc._id,
            type: "DOCTOR",
        });

        // Store Doctor Token in Redis
        await redisClient.set(`user:access:${doc._id}`, accessToken, { EX: 600 });
        await redisClient.set(`user:refresh:${doc._id}`, refreshToken, { EX: 604800 });

        // Store Doctor Token in Cookie
        commonUtils.storeAcessTokenInCookie(res, "accessToken", accessToken);
        commonUtils.storeRefreshTokenInCookie(res, "refreshToken", refreshToken);


        // create wallet for Doctor

        const doctotrId = doc._id;

        const existingWallet = await Wallet.findOne({ doctotrId });
        if (!existingWallet) {
            await Wallet.create({ doctotrId, balance: 0 });
            console.log(`Wallet created for user ${doctotrId} withdrawal request.`);
        }



        return commonUtils.sendSuccessResponse(req, res, appStrings.DOCTOR_REGISTER, {
            doc: {
                id: doc._id,
                name: doc.name,
                email: doc.email,
                mobileNo: doc.mobileNo,
                country: doc.country,
                countryCode: doc.countryCode,
                status: ENUM.STATUS.ACTIVE,
                emailOtp: doc.emailOtp,
                appointmentsCharges: doc.appointmentsCharges
            },
            accessToken,
            refreshToken
        })
    }
    catch (err) {
        console.log(appStrings.DOCTOR_REGISTET_FAILED, err);
        return commonUtils.sendErrorResponse(
            req,
            res,
            appStrings.DOCTOR_REGISTET_FAILED,
            { error: err.message },
            500,
        );
    }
}


//==========================Login==================================//

const doctorLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const doctor = await Doctor.findOne({ email: email })

        console.log(doctor)
        if (!doctor) {
            return commonUtils.sendSuccessResponse(req, res, appStrings.USER_NOT_FOUND)
        }


        const match = await bcrypt.compare(password, doctor.password);

        if (!match) {
            return commonUtils.sendErrorResponse(req, res, appStrings.WRONG_PASSWORD);
        }

        if (doctor.email && doctor.isEmailVarified === ENUM.ACCOUNT_VERIFIED.NO) {
            return commonUtils.sendErrorResponse(req, res, appStrings.VERIFY_EMAIL_FIRST, null)
        }
        console.log("...................", doctor.email)
        console.log("...................", doctor.isEmailVarified)

        const accessToken = token.generateAccessToken({
            id: doctor._id,
            type: "DOCTOR",
        });
        const refreshToken = token.generateRefreshToken({
            id: doctor._id,
            type: "DOCTOR",
        });

        commonUtils.storeAcessTokenInCookie(res, "accessToken", accessToken);
        commonUtils.storeRefreshTokenInCookie(res, "refreshToken", refreshToken);

        // Store Admin Token in Redis
        await redisClient.set(`user:access:${doctor._id}`, accessToken, {
            EX: config.REDIS_ACCESS_TOKEN_EXPIRE,
        });

        return commonUtils.sendSuccessResponse(req, res, appStrings.LOGIN_SUCCESS, {
            doctor: {
                id: doctor._id,
                name: doctor.name,
                email: doctor.email,
                status: ENUM.STATUS.ACTIVE,
            },
            accessToken,
            refreshToken,
        });
    }
    catch (err) {
        console.log(err.message)
        return commonUtils.sendErrorResponse(req, res, err.message);
    }
}


//==========================Verify Otp==================================//

const verifyEmailOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return commonUtils.sendErrorResponse(req, res, appStrings.EMAIL_OTP_REQUIRED);
        }

        const doctor = await Doctor.findOne({ email });
        if (!doctor) {
            return commonUtils.sendErrorResponse(req, res, appStrings.USER_NOT_FOUND);
        }

        if (!doctor.emailOtp || doctor.emailOtpExpire < Date.now()) {
            return commonUtils.sendErrorResponse(req, res, appStrings.OTP_EXPIRED);
        }

        if (doctor.emailOtp !== otp.toString()) {
            return commonUtils.sendErrorResponse(req, res, appStrings.INVALID_OTP);
        }
        doctor.isEmailVarified = ENUM.ACCOUNT_VERIFIED.YES;
        doctor.emailOtp = null;
        doctor.emailOtpExpire = null;
        await doctor.save();

        return commonUtils.sendSuccessResponse(req, res, appStrings.EMAIL_VERIFIED);
    } catch (err) {
        consol.log(err)
        return commonUtils.sendErrorResponse(req, res, err.message);
    }
};



//=============== Update Doctor ===========================//
const updateStep = async (req, res) => {
    try {
        let { step, ...data } = req.body;
        
        // If step 1, gather the names of the uploaded documents that Multer captured
        if (Number(step) === 1 && req.files && req.files.length > 0) {
            data.documents = req.files.map(file => file.filename);
        }

        if (!step) {
            return commonUtils.sendErrorResponse(req, res, "Step number is required", null, 400);
        }
        
        const key = "step" + step; // Maps 1 to "step1"
        const doctor = await Doctor.findById(req.userId);
        if (!doctor) return commonUtils.sendErrorResponse(req, res, "Doctor not found", null, 404);
        
        const setting = await Settings.findOne();
        if (!setting || !setting.stepLevel || setting.stepLevel.length === 0) {
            return commonUtils.sendErrorResponse(req, res, "Step rules not defined by admin yet.", null, 400);
        }

        const stepLevelObj = setting.stepLevel[0];
        const stepRule = stepLevelObj[key];
        
        if (!stepRule || !stepRule.key) {
             return commonUtils.sendErrorResponse(req, res, "Invalid step rule in settings", null, 400);
        }

        // Find if this step already exists in doctor.steps
        const stepIndex = doctor.steps.findIndex(s => s.data && s.data.stepKey === key);

        if (stepIndex > -1) {
            doctor.steps[stepIndex].data = { ...data, stepKey: key };
            doctor.steps[stepIndex].isCompleted = true;
        } else {
            doctor.steps.push({
                // using setting._id just to satisfy schema ref
                stepId: setting._id,
                data: { ...data, stepKey: key },
                isCompleted: true
            });
        }

        // reset status
        doctor.isAccountVerified = ENUM.ACCOUNT_VERIFIED_STATUS.PENDING;
        doctor.rejectionReason = null;

        await doctor.save();

        return commonUtils.sendSuccessResponse(req, res, "Step updated successfully and is pending admin approval.");
    } catch (err) {
         return commonUtils.sendErrorResponse(req, res, err.message, null, 500);
    }
};

//=============== Edit Doctor Profile =======================//
const editProfile = async (req, res) => {
    try {
        const { name, mobileNo, country, countryCode, appointmentsCharges } = req.body;
        const doctor = await Doctor.findById(req.userId);
        if (!doctor) return commonUtils.sendErrorResponse(req, res, "Doctor not found", null, 404);

        let profileEdited = false;

        if (name && name !== doctor.name) { doctor.name = name; profileEdited = true; }
        if (mobileNo && mobileNo !== doctor.mobileNo) { doctor.mobileNo = mobileNo; profileEdited = true; }
        if (country && country !== doctor.country) { doctor.country = country; profileEdited = true; }
        if (countryCode && countryCode !== doctor.countryCode) { doctor.countryCode = countryCode; profileEdited = true; }
        if (appointmentsCharges && appointmentsCharges !== doctor.appointmentsCharges) { doctor.appointmentsCharges = appointmentsCharges; profileEdited = true; }

        if (profileEdited) {
            // As per requirements: "if doctor edit there profile after updation admin should verify afain"
            doctor.isAccountVerified = ENUM.ACCOUNT_VERIFIED_STATUS.PENDING;
            doctor.stepVerified = ENUM.STEP_VERIFIED_STATUS.PENDING;
            await doctor.save();
            return commonUtils.sendSuccessResponse(req, res, "Profile updated successfully. Your account is unverified pending Admin approval.", { doctor });
        }

        return commonUtils.sendSuccessResponse(req, res, "No profile changes made.", { doctor });
    } catch (err) {
        return commonUtils.sendErrorResponse(req, res, err.message, null, 500);
    }
};

module.exports = { doctorRegister, doctorLogin, verifyEmailOtp, updateStep, editProfile };