const Doctor = require("../../doctor/model/doctorModel");
const ENUM = require("../../utils/enum");
const commonUtils = require("../../utils/commonUtils");

const approveDoctor = async (req, res) => {
    try {
        const { doctorId } = req.body;
        
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return commonUtils.sendErrorResponse(req, res, "Doctor not found.");
        }

        // The admin can review doctor.steps and decide to approve
        doctor.isAccountVerified = ENUM.ACCOUNT_VERIFIED_STATUS.VERIFIED;
        doctor.stepVerified = ENUM.STEP_VERIFIED_STATUS.SUCCESS;
        doctor.rejectionReason = null;
        
        await doctor.save();
        
        return commonUtils.sendSuccessResponse(req, res, "Doctor account has been verified and granted access.", doctor);
    } catch (error) {
         return commonUtils.sendErrorResponse(req, res, error.message);
    }
};

const getDoctorProfile = async (req, res) => {
    try {
        const doctorId = req.params.id;
        const doctor = await Doctor.findById(doctorId).populate("steps.stepId"); // Population may not strictly work if stepId ref Setting singleton, but it's safe.
        if (!doctor) {
            return commonUtils.sendErrorResponse(req, res, "Doctor not found.");
        }
        
        return commonUtils.sendSuccessResponse(req, res, "Doctor profile details.", doctor);
    } catch (error) {
         return commonUtils.sendErrorResponse(req, res, error.message);
    }
};

module.exports = { approveDoctor, getDoctorProfile };
