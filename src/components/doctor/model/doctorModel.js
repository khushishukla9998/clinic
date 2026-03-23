
const mongoose = require("mongoose");
const ENUM = require("../../utils/enum");
const appString = require("../../utils/appString");
const doctorSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    mobileNo: {
        type: Number,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    countryCode: {
        type: String,
        required: true
    },
    isEmailVarified: {
        type: Number,
        ENUM: [ENUM.ACCOUNT_VERIFIED.NO, ENUM.ACCOUNT_VERIFIED.YES],
        default: ENUM.ACCOUNT_VERIFIED.NO
    },
    isDeleted: {
        type: Number,
        enum: [ENUM.IS_DELETED.DELETED, ENUM.IS_DELETED.NOT_DELETED],
        default: ENUM.IS_DELETED.NOT_DELETED
    },
    isAccountVerified: {
        type: Number,
        ENUM: [ENUM.ACCOUNT_VERIFIED_STATUS.PENDING, ENUM.ACCOUNT_VERIFIED_STATUS.REJECTED, ENUM.ACCOUNT_VERIFIED_STATUS.VERIFIED],
        default: ENUM.ACCOUNT_VERIFIED_STATUS.PENDING,
    },

    steps: [
        {
            stepId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: appString.SETTING
            },
            data: {
                type: mongoose.Schema.Types.Mixed
            }
        },
        { _id: false }
    ],

    currentStep: {
       type:Number
    },

    stepVerified: {
        type: Number,
        Enum: [ENUM.STEP_VERIFIED_STATUS.SUCCESS, ENUM.STEP_VERIFIED_STATUS.PENDING]
    },

    appointmentsCharges: {
        type: Number,

    },

    rejectionReason: {
        type: String
    },

    otp: String,
    otpExpire: Date,
    emailOtp: String,
    emailOtpExpire: Date,
    emailOtpLastSend: Date,
    mobileOtpLastSend: Date,

}, { timestamps: true })

module.exports = mongoose.model(appString.DOCTOR, doctorSchema)