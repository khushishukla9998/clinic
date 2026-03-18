const mongoose = require("mongoose");
const ENUM = require("../../utils/enum");
const appString = require("../../utils/appString");
const stepsSchema = mongoose.Schema({

    verificationSteps: [{
        title: String,
        key: String,
        order: Number,
        isRequired: {
            type: Number,
            required: true,
            ENUM: [ENUM.IS_REQUIRED.NO, ENUM.IS_REQUIRED.YES]
        },

        status: {
            type: Number,
            ENUM: [ENUM.STEP_STATUS.ACTIVE, ENUM.STEP_STATUS.INACTIVE],
            default: ENUM.STEP_STATUS.ACTIVE
        },
    }],

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: appString.ADMIN
    }

}, { timestamps: true })

module.exports = mongoose.model(appString.STEP, stepsSchema)