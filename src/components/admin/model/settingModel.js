const mongoose = require("mongoose");
const ENUM = require("../../utils/enum");
const appString = require("../../utils/appString");


//===============Verification Steps =======================//

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
}, { _id: false });



// ============ Time Slot=================//

const timeSlots = new mongoose.Schema({
    monday: { type: Map, of: String },
    tuesday: { type: Map, of: String },
    wednesday: { type: Map, of: String },
    thursday: { type: Map, of: String },
    friday: { type: Map, of: String },
    saturday: { type: Map, of: String },
    sunday: { type: Map, of: String }
}, { _id: false });


//========== Setting ============================//

const settingSchema = mongoose.Schema({
    stepLevel: {
        type: [steps]
    },

    timeSlot: {
        type: [timeSlots]
    },

    patientRegistrationBonus: {
        type: Number,
        default: 1000
    }

})
module.exports = mongoose.model(appString.SETTING, settingSchema)
