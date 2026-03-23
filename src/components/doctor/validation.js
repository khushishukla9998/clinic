const { validatorUtilWithCallback } = require("../utils/commonUtils");

const profileValidation = async (req, res, next) => {
    
    // If files were successfully attached by Multer, map them to the body 
    // so the validation rule can natively verify they exist!
    if (req.files && req.files.length > 0) {
        req.body.documents = req.files;
    }

    let validationRule = {
        step: "required|numeric|min:1|max:6",
    };

    if (req.body.step == 1) {
        validationRule.documents = "required|array";
    }
    else if (req.body.step == 2) {
        validationRule.appointmentCharges = "required|numeric|min:0"; // 60 mins only
    }
    else if (req.body.step == 3) {
        // Validation for time slots object/array
        validationRule.availableTimeSlots = "required";
    }
    else if (req.body.step == 4) {
        validationRule.qualifications = "required|array";
    }
    else if (req.body.step == 5) {
        validationRule.unavailableDates = "required|array";
    }
    else if (req.body.step == 6) {
        validationRule.experienceDetails = "required|array";
    }

    // calling common validator utility
    validatorUtilWithCallback(req, res, next, validationRule);
};

module.exports = {
    profileValidation
};
