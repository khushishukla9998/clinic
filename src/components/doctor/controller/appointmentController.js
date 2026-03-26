const Appointment = require("../model/appointmentModel");
const commonUtils = require("../../utils/commonUtils");
const moment = require("moment");
const appString = require("../../utils/appString");
const ENUM = require("../../utils/enum");


// ================GET LISST OF APPOINTMENT=================

const getAppointments = async (req, res) => {
    try {
    
        const statusFilter = req.query.status;
let searchQuery = {
            doctorId: req.userId
        }

        if (statusFilter) {
            searchQuery.status = statusFilter.toUpperCase();
        }
        const appointments = await Appointment.find(searchQuery).sort({ date: 1, startTime: 1 });
        return commonUtils.sendSuccessResponse(req, res, appString,appString.FETCH_SUCESS, appointments);
    } catch (error) {
        return commonUtils.sendErrorResponse(req, res, error.message, null, 500);
    }
};



//======================= DETALIS OF APPOINTMENT =========================

const getAppointmentDetails = async (req, res) => {
    try {

        const appointmentId = req.params.id;
        const appointment = await Appointment.findOne({
            _id: appointmentId,
            doctorId: req.userId
        });
        if (!appointment) {
            return commonUtils.sendErrorResponse(req, res,appString.NOT_FOUND, null, 404);
        }
        return commonUtils.sendSuccessResponse(req, res, appString.FETCH_SUCESS, appointment);
    } catch (error) {
        return commonUtils.sendErrorResponse(req, res, error.message, null, 500);
    }
};





//====================== UPDATE STATUS OF APPOINTMENT =============================

const updateAppointmentStatus = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        let newStatus = req.body.status;


        if (newStatus) {
            newStatus = newStatus
        }
        const allowedStatuses = [ENUM.APPOINTMENT_STATUS.ACCEPTED,ENUM.APPOINTMENT_STATUS.CANCELLED,ENUM.APPOINTMENT_STATUS.REJECTED];
        if (!allowedStatuses.includes(newStatus)) {
            return commonUtils.sendErrorResponse(req, res,appString.INVALID_AP_STATUS, null, 400);
        }
        const appointment = await Appointment.findOne({
            _id: appointmentId,
            doctorId: req.userId
        });

        if (!appointment) {
            return commonUtils.sendErrorResponse(req, res, appString.NOT_FOUND, null, 404);
        }
        if (appointment.status === ENUM.APPOINTMENT_STATUS.COMPLETED) {
            return commonUtils.sendErrorResponse(req, res,appString.CAN_NOT_UPDATE , null, 400);
        }
        appointment.status = newStatus;
        await appointment.save();

        return commonUtils.sendSuccessResponse(req, res, `Appointment status updated to ${newStatus}.`, appointment);
    } catch (error) {
        return commonUtils.sendErrorResponse(req, res, error.message, null, 500);
    }
};



//=====================  RESCHEDULE THE APPOINTMENT ==============================

const rescheduleAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const { newDate, newStartTime, newEndTime } = req.body;

        const appointment = await Appointment.findOne({
            _id: appointmentId,
            doctorId: req.userId
        });

        if (!appointment) {
            return commonUtils.sendErrorResponse(req, res, appString.NOT_FOUND, null, 404);
        }

        const blockedStatuses = [ENUM.APPOINTMENT_STATUS.CANCELLED,ENUM.APPOINTMENT_STATUS.COMPLETED,ENUM.APPOINTMENT_STATUS.REJECTED];
        if (blockedStatuses.includes(appointment.status)) {
            return commonUtils.sendErrorResponse(req, res, appString.CAN_NOT_RESCHEDULE , null, 400);
        }

        const appointmentDateTimeString = `${appointment.date} ${appointment.startTime}`;
        const appointmentMoment = moment(appointmentDateTimeString, "YYYY-MM-DD HH:mm");
        const currentMoment = moment();
        const minutesUntilAppointment = appointmentMoment.diff(currentMoment, 'minutes');
        if (minutesUntilAppointment <= 0) {
            return commonUtils.sendErrorResponse(req, res, appString.CAN_NOT_RESCHEDULE_STARTED ,null, 403);
        }

        if (minutesUntilAppointment <= 60) {
            return commonUtils.sendErrorResponse(req, res,appString.APPOINTMENT_STARTED, null, 403);
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
        appointment.status = ENUM.APPOINTMENT_STATUS.UPCOMING;
        await appointment.save();

        return commonUtils.sendSuccessResponse(req, res, appString.APPOINTMENT_SUCESS, appointment);
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
















