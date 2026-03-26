const { validatorUtilWithCallback } = require("../utils/commonUtils");

const profileValidation = async (req, res, next) => {
    
    // Safely initialize req.body if it's undefined (e.g., misconfigured headers)
    if (!req.body) {
        req.body = {};
    }

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

const registerValidation = (req, res, next) => {
    const rules = {
        name: "required|string",
        email: "required|email",
        password: "required|string|min:6",
        mobileNo: "required|numeric",
        country: "required|string",
        countryCode: "required|string",
    };
    validatorUtilWithCallback(req, res, next, rules);
};

const loginValidation = (req, res, next) => {
    const rules = {
        email: "required|email",
        password: "required|string",
    };
    validatorUtilWithCallback(req, res, next, rules);
};

const verifyOtpValidation = (req, res, next) => {
    const rules = {
        email: "required|email",
        otp: "required",
    };
    validatorUtilWithCallback(req, res, next, rules);
};

const editProfileValidation = (req, res, next) => {
    const rules = {
        name: "string",
        mobileNo: "numeric",
        country: "string",
        countryCode: "string",
        appointmentsCharges: "numeric",
    };
    validatorUtilWithCallback(req, res, next, rules);
};

const requestLeaveValidation = (req, res, next) => {
    const rules = {
        unavailableDates: "required",
        leaveType: "required|numeric",
    };
    validatorUtilWithCallback(req, res, next, rules);
};

module.exports = {
    profileValidation,
    registerValidation,
    loginValidation,
    verifyOtpValidation,
    editProfileValidation,
    requestLeaveValidation,
};
