const patientController = require("./controller/patientController");
const doctorViewController = require("./controller/doctorViewController");
const appointmentController = require("./controller/appointmentController");
const patientValidation = require("./validation");

module.exports = [

    //============= Auth =============//
    {
        path: "/register",
        method: "post",
        controller: patientController.patientRegister,
        isPublic: true,
        validation: patientValidation.registerValidation
    },
    {
        path: "/login",
        method: "post",
        controller: patientController.patientLogin,
        isPublic: true,
        validation: patientValidation.loginValidation
    },
    {
        path: "/verifyOtp",
        method: "post",
        controller: patientController.verifyEmailOtp,
        isPublic: true,
        validation: patientValidation.otpValidation
    },

    //============= Doctor Profile Viewing =============//
    {
        path: "/doctors/available-today",
        method: "get",
        controller: doctorViewController.getAvailableDoctorsToday,
    },
    {
        path: "/doctors",
        method: "get",
        controller: doctorViewController.getDoctors,
    },
    {
        path: "/doctors/:id",
        method: "get",
        controller: doctorViewController.getDoctorProfile,
    },

    //============= Appointment Management =============//
    {
        path: "/doctors/:id/slots",
        method: "get",
        controller: appointmentController.getAvailableSlots,
    },
    {
        path: "/appointments/book",
        method: "post",
        controller: appointmentController.bookAppointment,
        validation: patientValidation.bookAppointmentValidation
    },
    {
        path: "/appointments",
        method: "get",
        controller: appointmentController.getAppointments,
    },
    {
        path: "/appointments/:id",
        method: "get",
        controller: appointmentController.getAppointmentDetails,
    },
    {
        path: "/appointments/:id/reschedule",
        method: "put",
        controller: appointmentController.rescheduleAppointment,
        validation: patientValidation.rescheduleValidation
    },
    {
        path: "/appointments/:id/cancel",
        method: "put",
        controller: appointmentController.cancelAppointment,
        validation: patientValidation.cancelValidation
    },
];
