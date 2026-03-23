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
        // Optional for now if no Patient model exists, but we'll link it later.
        type: mongoose.Schema.Types.ObjectId,
        ref: appString.PATIENTS, // Assuming User is patient or will be Patient
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

// Assume appString has APPOINTMENT, if not we just use string.
const modelName = appString.APPOINTMENT || "Appointment";
module.exports = mongoose.model(modelName, appointmentSchema);
