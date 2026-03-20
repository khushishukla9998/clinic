const mongoose = require("mongoose");
const appString = require("../../utils/appString");
const userWallet = new mongoose.Schema({

    doctotrId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: appString.DOCTOR
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


},
    { timestamps: true }
)

module.exports = mongoose.model("Wallet", userWallet)