const mongoose = require("mongoose");
const ENUM = require("../../utils/enum");
const appString = require("../../utils/appString");

const appointmentSchema = new mongoose.Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: appString.DOCTOR,
        required: true
    },
    patientId: {
       
        type: mongoose.Schema.Types.ObjectId,
        ref: appString.PATIENTS,
        required: true 
    },
    date: {
        type: String, // format YYYY-MM-DD
        required: true
    },
    startTime: {
        type: String, // format HH:mm 
        required: true
    },
    endTime: {
        type: String, // format HH:mm
        required: true
    },
    status: {
        type: String,
        enum: ["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED", "REJECTED", "PENDING", "ACCEPTED"],
        default: "UPCOMING"
    },
    appointmentCharge: {
        type: Number,
        required: true
    }
}, { timestamps: true });



module.exports = mongoose.model("Appointment", appointmentSchema);
