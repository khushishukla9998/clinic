const { validatorUtilWithCallback } = require("../utils/commonUtils");

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

const otpValidation = (req, res, next) => {
    const rules = {
        email: "required|email",
        otp: "required",
    };
    validatorUtilWithCallback(req, res, next, rules);
};

const bookAppointmentValidation = (req, res, next) => {
    const rules = {
        doctorId: "required|string",
        date: "required|string",
        startTime: "required|string",
        endTime: "required|string",
    };
    validatorUtilWithCallback(req, res, next, rules);
};

const rescheduleValidation = (req, res, next) => {
    const rules = {
        newDate: "string",
        newStartTime: "string",
        newEndTime: "string",
    };
    validatorUtilWithCallback(req, res, next, rules);
};

const cancelValidation = (req, res, next) => {
    
    const rules = {
      
    };
    validatorUtilWithCallback(req, res, next, rules);
};

module.exports = {
    registerValidation,
    loginValidation,
    otpValidation,
    bookAppointmentValidation,
    rescheduleValidation,
    cancelValidation
};
