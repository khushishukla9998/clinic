const mongoose = require("mongoose");
const ENUM = require("../../utils/enum");
const appString = require("../../utils/appString");



//=============== Time Slot =====================//
const timeSlotSchema = new mongoose.Schema({
    startTime: String,
    endTime: String,

}, { _id: false });



//================= Leave Modal ==================//
const leavSchema = mongoose.Schema({

    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: appString.DOCTOR
    },
    leaveStatus: {
        type: String,
        ENUM: [ENUM.LEAVE_STATUS.APPROVED, ENUM.LEAVE_STATUS.PENDING, ENUM.LEAVE_STATUS.REJECTED],
        default: ENUM.LEAVE_STATUS.PENDING
    },

    leaveType: {
        type: Number,
        ENUM: [ENUM.LEAVE_TYPE.PERSONAL, ENUM.LEAVE_TYPE.VACATION],
        required: true
    },

    reason: {
        type: String 
    },
    rejectionReason: {
        type: String 
    },
    unavailableDates: {
        type: Map,
        of: [timeSlotSchema],
         category: String
    },

   

}, { timestamps: true })

module.exports = mongoose.model("Leave", leavSchema)