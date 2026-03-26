const jwt = require("jsonwebtoken");
const config = require("../../config/dev.json");
const commonUtils = require("../components/utils/commonUtils");
const appStrings = require("../components/utils/appString");
const Doctor = require("../components/doctor/model/doctorModel");
const ENUM = require("../components/utils/enum");
const appString = require("../components/utils/appString");

async function isDoctorVerified(req, res, next) {
    try {

        if (req.type !== "DOCTOR") {

            return next();
        }

        const doctorId = req.userId;
        const doctor = await Doctor.findById(doctorId);

        if (!doctor) {
            return commonUtils.sendErrorResponse(req, res, appStrings.USER_NOT_FOUND, null, 404);
        }

        if (doctor.isAccountVerified !== ENUM.ACCOUNT_VERIFIED_STATUS.VERIFIED) {
            return commonUtils.sendErrorResponse(
                req,
                res,
                appString.NOT_ACCESSIBLE,
                null,
                403
            );
        }

        next();
    } catch (err) {
        console.error("isDoctorVerified error:", err.message);
        return commonUtils.sendErrorResponse(req, res, appString.INTERNAL_ERROR, null, 500);
    }
}

module.exports = { isDoctorVerified };
