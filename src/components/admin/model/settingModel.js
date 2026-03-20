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



// ============ Time Slot=================//

const timeSlots = new mongoose.Schema({
    monady: {
        key: Date,
        brakTime: {
            type: String
        }
    },

    tuesday: {
        key: Date,
        brakTime: {
            type: String
        },
    },

    wednsday: {
        key: Date,
        brakTime: {
            type: String
        },
    },
    thursday: {
        key: Date,
        brakTime: {
            type: String
        },
    },
    friday: {
        key: Date,
        brakTime: {
            type: String
        },
    },
    saturday: {
        key: Date,
        brakTime: {
            type: String
        },
    },
    sunday: {
        key: Date,
        brakTime: {
            type: String
        },
    },



})


//========== Setting ============================//

const settingSchema = mongoose.Schema({
    stepLevel: {
        type: [steps]
    },

    timeSlot: {
        type: [timeSlots]
    }


})
module.exports = mongoose.model(appString.SETTING, settingSchema)
