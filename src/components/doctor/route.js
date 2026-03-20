
const doctorController = require("../doctor/controller/doctorController")
const leaveController = require("../doctor/controller/leaveController")

module.exports = [


    //============= admin =============//
    {
        path: "/registerDoctor",
        method: "post",
        controller: doctorController.doctorRegister,
        isPublic: true,
        // validation: adminValidation.registerValidation
    },
   {
        path: "/loginDoctor",
        method: "post",
        controller: doctorController.doctorLogin,
        isPublic: true,
        // validation: adminValidation.registerValidation
    },

       {
        path: "/verifyOtp",
        method: "post",
        controller: doctorController.verifyEmailOtp,
        // validation: adminValidation.registerValidation
    },

    {
        path: "/stepUpdate/:id",
        method: "post",
        controller: doctorController.updateStep,
        // validation: adminValidation.registerValidation
    },


     {
        path: "/requestLeave",
        method: "post",
        controller: leaveController.requestLeave,
        // validation: adminValidation.registerValidation
    },
]