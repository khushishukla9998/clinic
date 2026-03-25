const Doctor = require("../../doctor/model/doctorModel");
const ENUM = require("../../utils/enum");
const commonUtils = require("../../utils/commonUtils");
const appString = require("../../utils/appString")
const Settings = require("../model/settingModel")

const approveDoctor = async (req, res) => {
    try {
        const { doctorId, status, rejectionReason } = req.body;

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return commonUtils.sendErrorResponse(req, res,appString.DOCTOR_NOT_FOUND);
        }

        const stepCount = doctor.steps.length;
        console.log("stepCount::::::::", stepCount)

        const stepId = doctor.stepId
        console.log("stepId::::::::", stepId)


        const setting = await Settings.findOne({ stepId });
        console.log("settings::::::::", setting)

        const stepsLength = Object.keys(setting.stepLevel).length;
        console.log("stepsLength:::::", stepsLength);



        const acStatus = [ENUM.ACCOUNT_VERIFIED_STATUS.REJECTED, ENUM.ACCOUNT_VERIFIED_STATUS.VERIFIED]

        if (status == ENUM.ACCOUNT_VERIFIED_STATUS.VERIFIED) {
            doctor.isAccountVerified = ENUM.ACCOUNT_VERIFIED_STATUS.VERIFIED;
            doctor.stepVerified = ENUM.STEP_VERIFIED_STATUS.SUCCESS;
            doctor.rejectionReason = null;
        }
        else {
            if (doctor.isAccountVerified = ENUM.ACCOUNT_VERIFIED_STATUS.REJECTED && !rejectionReason) {
                return commonUtils.sendErrorResponse(req, res, appString.REJECTION_REASON_ACCOUNT, null, 400);
            }



            doctor.stepVerified = ENUM.STEP_VERIFIED_STATUS.PENDING;
            doctor.rejectionReason = rejectionReason;
        }



        await doctor.save();
        const message = doctor.isAccountVerified === ENUM.ACCOUNT_VERIFIED_STATUS.VERIFIED
            ? appString.ACCOUNT_ACCESS
            : appString.ACCOUNT_RTEJECTED;

        return commonUtils.sendSuccessResponse(req, res, message, doctor);
    } catch (error) {
        return commonUtils.sendErrorResponse(req, res, error.message);
    }
};



const getDoctorProfile = async (req, res) => {
    try {
        const doctorId = req.params.id;
        const doctor = await Doctor.findById(doctorId).populate("steps.stepId");
        if (!doctor) {
            return commonUtils.sendErrorResponse(req, res, appString.DOCTOR_NOT_FOUND);
        }




        return commonUtils.sendSuccessResponse(req, res,appString.PROFILE_DETAIL , doctor);
    } catch (error) {
        return commonUtils.sendErrorResponse(req, res, error.message);
    }
};

module.exports = { approveDoctor, getDoctorProfile };
