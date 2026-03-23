
const doctorController = require("../doctor/controller/doctorController")
const leaveController = require("../doctor/controller/leaveController")
const appointmentController = require("../doctor/controller/appointmentController")
const { isDoctorVerified } = require("../../middelware/isDoctorVerified");
const doctorValidation = require("./validation");
const upload = require("../../middelware/upload");

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
        middleware: upload.array("documents", 5), // Allow up to 5 documents securely attached
        controller: doctorController.updateStep,
        validation: doctorValidation.profileValidation
    },
    
    {
        path: "/editProfile",
        method: "post",
        controller: doctorController.editProfile,
        // Profile editing shouldn't require verification 
    },

     {
        path: "/requestLeave",
        method: "post",
        controller: leaveController.requestLeave,
        validation: isDoctorVerified
    },

    //========= Appointment Management ========//
    {
        path: "/appointments",
        method: "get",
        controller: appointmentController.getAppointments,
        validation: isDoctorVerified
    },
    {
        path: "/appointments/:id",
        method: "get",
        controller: appointmentController.getAppointmentDetails,
        validation: isDoctorVerified
    },
    {
        path: "/appointments/:id/status",
        method: "put",
        controller: appointmentController.updateAppointmentStatus,
        validation: isDoctorVerified
    },
    {
        path: "/appointments/:id/reschedule",
        method: "put",
        controller: appointmentController.rescheduleAppointment,
        validation: isDoctorVerified
    }
]