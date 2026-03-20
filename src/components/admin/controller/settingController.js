const ENUM = require("../../utils/enum")
const commonUtils = require("../../utils/commonUtils")
const appStrings = require("../../utils/appString");
const config = require("../../../../config/dev.json");

const Admin = require("../model/adminModel");
const Setting = require("../model/settingModel")



 const createStep = async (req, res) => {
    try {
        const { stepLevel } = req.body;
        console.log(stepLevel)
        const newSetting = new Setting({ stepLevel:stepLevel});
      await newSetting.save();
    return commonUtils.sendSuccessResponse(req,res,"created",newSetting)
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
module.exports = { createStep }