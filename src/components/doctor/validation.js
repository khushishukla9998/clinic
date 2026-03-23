const { validatorUtilWithCallback } = require("../utils/commonUtils");

const profileValidation = async (req, res, next) => {
    
    if (req.files && req.files.length > 0) {
        req.body.documents = req.files;
    }

    let validationRule = {
        step: "required",
    };

    if (req.body.step == 1) {
        validationRule.documents = "required|array";
    }
    else if (req.body.step == 2) {
        validationRule.appointmentCharges = "required|numeric|min:0|max:2000"; 
    }
    else if (req.body.step == 3) {
        validationRule.availableTimeSlots = "array" ;
    }
    else if (req.body.step == 4) {
        validationRule.qualifications = "array";
    }
    else if (req.body.step == 5) {
        validationRule.experienceDetails = "array";
    }

   
    validatorUtilWithCallback(req, res, next, validationRule);
};

module.exports = {
    profileValidation
};
