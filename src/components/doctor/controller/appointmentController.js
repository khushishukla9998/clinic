const Appointment = require("../model/appointmentModel");
const commonUtils = require("../../utils/commonUtils");
const moment = require("moment");


const getAppointments = async (req, res) => {
    try {
        // ( ?status=UPCOMING)
        const statusFilter = req.query.status;
let searchQuery = {
            doctorId: req.userId
        }

        if (statusFilter) {
            searchQuery.status = statusFilter.toUpperCase();
        }
        const appointments = await Appointment.find(searchQuery).sort({ date: 1, startTime: 1 });
        return commonUtils.sendSuccessResponse(req, res, "Appointments retrieved successfully.", appointments);
    } catch (error) {
        return commonUtils.sendErrorResponse(req, res, error.message, null, 500);
    }
};


const getAppointmentDetails = async (req, res) => {
    try {

        const appointmentId = req.params.id;
        const appointment = await Appointment.findOne({
            _id: appointmentId,
            doctorId: req.userId
        });
        if (!appointment) {
            return commonUtils.sendErrorResponse(req, res, "Appointment not found.", null, 404);
        }
        return commonUtils.sendSuccessResponse(req, res, "Appointment details retrieved.", appointment);
    } catch (error) {
        return commonUtils.sendErrorResponse(req, res, error.message, null, 500);
    }
};


const updateAppointmentStatus = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        let newStatus = req.body.status;


        if (newStatus) {
            newStatus = newStatus.toUpperCase();
        }
        const allowedStatuses = ["ACCEPTED", "REJECTED", "CANCELLED"];
        if (!allowedStatuses.includes(newStatus)) {
            return commonUtils.sendErrorResponse(req, res, "Invalid status. Please use ACCEPTED, REJECTED, or CANCELLED.", null, 400);
        }
        const appointment = await Appointment.findOne({
            _id: appointmentId,
            doctorId: req.userId
        });

        if (!appointment) {
            return commonUtils.sendErrorResponse(req, res, "Appointment not found.", null, 404);
        }
        if (appointment.status === "COMPLETED") {
            return commonUtils.sendErrorResponse(req, res, "Cannot update an appointment that is already completed.", null, 400);
        }
        appointment.status = newStatus;
        await appointment.save();

        return commonUtils.sendSuccessResponse(req, res, `Appointment status updated to ${newStatus}.`, appointment);
    } catch (error) {
        return commonUtils.sendErrorResponse(req, res, error.message, null, 500);
    }
};


const rescheduleAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const { newDate, newStartTime, newEndTime } = req.body;

        const appointment = await Appointment.findOne({
            _id: appointmentId,
            doctorId: req.userId
        });

        if (!appointment) {
            return commonUtils.sendErrorResponse(req, res, "Appointment not found.", null, 404);
        }

        const blockedStatuses = ["COMPLETED", "CANCELLED", "REJECTED"];
        if (blockedStatuses.includes(appointment.status)) {
            return commonUtils.sendErrorResponse(req, res, "Cannot reschedule completed, cancelled, or rejected appointments.", null, 400);
        }

        const appointmentDateTimeString = `${appointment.date} ${appointment.startTime}`;
        const appointmentMoment = moment(appointmentDateTimeString, "YYYY-MM-DD HH:mm");
        const currentMoment = moment();
        const minutesUntilAppointment = appointmentMoment.diff(currentMoment, 'minutes');
        if (minutesUntilAppointment <= 0) {
            return commonUtils.sendErrorResponse(req, res, "Cannot reschedule an appointment that has already started or passed.", null, 403);
        }

        if (minutesUntilAppointment <= 60) {
            return commonUtils.sendErrorResponse(req, res, "Appointments starting within 60 minutes cannot be rescheduled.", null, 403);
        }
        if (newDate) {
            appointment.date = newDate;
        }
        if (newStartTime) {
            appointment.startTime = newStartTime;
        }
        if (newEndTime) {
            appointment.endTime = newEndTime;
        }
        appointment.status = "UPCOMING";
        await appointment.save();

        return commonUtils.sendSuccessResponse(req, res, "Appointment rescheduled successfully.", appointment);
    } catch (error) {
        return commonUtils.sendErrorResponse(req, res, error.message, null, 500);
    }
};

module.exports = {
    getAppointments,
    getAppointmentDetails,
    updateAppointmentStatus,
    rescheduleAppointment
};
