const { validatorUtilWithCallback } = require("../utils/commonUtils");

const registerValidation = (req, res, next) => {
    const rules = {
        name: "required|string",
        email: "required|email",
        password: "required|string|min:6",
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

const approveDoctorValidation = (req, res, next) => {
    const rules = {
        doctorId: "required|string",
        status: "required|numeric",
    };
    validatorUtilWithCallback(req, res, next, rules);
};

const updateLeaveStatusValidation = (req, res, next) => {
    const rules = {
        status: "required|numeric",
    };
    validatorUtilWithCallback(req, res, next, rules);
};

const createStepValidation = (req, res, next) => {
    const rules = {
        step1: "required",
        step2: "required",
        step3: "required",
        step4: "required",
    };
    validatorUtilWithCallback(req, res, next, rules);
};

module.exports = {
    registerValidation,
    loginValidation,
    approveDoctorValidation,
    updateLeaveStatusValidation,
    createStepValidation,
};
