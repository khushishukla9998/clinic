const mongoose = require("mongoose");
const ENUM = require("../../utils/enum");
const appString = require("../../utils/appString");

const steps = new mongoose.Schema({

       step1: {
                key: String,
                isRequired: {
                    type: Number,
                    ENUM: [ENUM.IS_REQUIRED.NO, ENUM.IS_REQUIRED.YES]
                },
            },

             step2: {
                key: String,
                isRequired: {
                    type: Number,
                    ENUM: [ENUM.IS_REQUIRED.NO, ENUM.IS_REQUIRED.YES]
                },
            },

             step3: {
                key: String,
                isRequired: {
                    type: Number,
                    ENUM: [ENUM.IS_REQUIRED.NO, ENUM.IS_REQUIRED.YES]
                },
            },

             step4: {
                key: String,
                isRequired: {
                    type: Number,
                    ENUM: [ENUM.IS_REQUIRED.NO, ENUM.IS_REQUIRED.YES]
                },
            },

             step5: {
                key: String,
                isRequired: {
                    type: Number,
                    ENUM: [ENUM.IS_REQUIRED.NO, ENUM.IS_REQUIRED.YES]
                },
            },

             step6: {
                key: String,
                isRequired: {
                    type: Number,
                    ENUM: [ENUM.IS_REQUIRED.NO, ENUM.IS_REQUIRED.YES]
                },
            },
        
        
    

}, { _id: false });


const settingSchema = mongoose.Schema({
    leaveAproval: {
        type: String,
        ENUM: [ENUM.LEAVE_MANAGE.APPROVED, ENUM.LEAVE_MANAGE.REJECTED, ENUM.LEAVE_MANAGE.PENDING],
        default: ENUM.LEAVE_MANAGE.PENDING
    },
    isDoctorVerified: {
        type: String,
        // ENUM: [ENUM.VERIFICATION_STATUS.VERIFIED, ENUM.VERIFICATION_STATUS.REJECTED]
    },
    stepLevel: {
        type: [steps]
    }
})
module.exports = mongoose.model(appString.SETTING, settingSchema)
