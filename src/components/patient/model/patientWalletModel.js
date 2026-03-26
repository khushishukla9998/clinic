const mongoose = require("mongoose");
const appString = require("../../utils/appString");

const patientWalletSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: appString.PATIENTS,
        required: true
    },
    balance: {
        type: Number,
        default: 0
    },
    creditAmount: {
        type: Number,
        default: 0
    },
    debitAmount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model("PatientWallet", patientWalletSchema);
