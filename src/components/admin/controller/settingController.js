const ENUM = require("../../utils/enum")
const commonUtils = require("../../utils/commonUtils")
const appStrings = require("../../utils/appString");
const config = require("../../../../config/dev.json");

const Admin = require("../model/adminModel");
const Setting = require("../model/settingModel");
const Doctor = require("../../doctor/model/doctorModel"); 

const createStep = async (req, res) => {
    try {
        const { stepLevel, timeSlot } = req.body;
        
        let setting = await Setting.findOne();
        if (setting) {
            if (stepLevel) setting.stepLevel = stepLevel;
            if (timeSlot) setting.timeSlot = timeSlot;
            await setting.save();
        } else {
            setting = new Setting({ stepLevel: stepLevel, timeSlot: timeSlot });
            await setting.save();
        }
       
        await Doctor.updateMany({}, { 
            isAccountVerified: ENUM.ACCOUNT_VERIFIED_STATUS.PENDING,
            stepVerified: ENUM.STEP_VERIFIED_STATUS.PENDING 
        });

        return commonUtils.sendSuccessResponse(req, res, "Steps updated and all Doctors are unverified pending new step completion.", setting);
    } catch (err) {
        return commonUtils.sendErrorResponse(req, res, err.message, null, 500);
    }
};

module.exports = { createStep };
