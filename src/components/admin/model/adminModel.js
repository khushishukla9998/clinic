
const mongoose = require("mongoose");
const ENUM = require("../../utils/enum");
const appString = require("../../utils/appString");
const adminSchema = mongoose.Schema({
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

    mobileNo:{
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

    isEmailVarified:{
        type:Number,
        ENUM:[ENUM.ACCOUNT_VERIFIED.NO,ENUM.ACCOUNT_VERIFIED.YES],
        default:ENUM.ACCOUNT_VERIFIED.NO
    },

    isDeleted: {
        type: Number,
        enum: [ENUM.IS_DELETED.DELETED, ENUM.IS_DELETED.NOT_DELETED],
        default: ENUM.IS_DELETED.NOT_DELETED
    }

},{ timestamps: true})

module.exports = mongoose.model(appString.ADMIN, adminSchema)