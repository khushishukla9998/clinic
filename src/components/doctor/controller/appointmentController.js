const Appointment = require("../model/appointmentModel");
const commonUtils = require("../../utils/commonUtils");
const moment = require("moment");

// ==========================================
// 1. Get All Appointments (with optional filter)
// ==========================================
const getAppointments = async (req, res) => {
    try {
        // Read the status from the query (e.g., ?status=UPCOMING)
        const statusFilter = req.query.status; 
        
        // Start building our search query
        let searchQuery = { 
            doctorId: req.userId // Only find appointments for the logged-in doctor
        };
        
        // If a status was provided in the URL, add it to our search query
        if (statusFilter) {
            searchQuery.status = statusFilter.toUpperCase();
        }

        // Find the appointments and sort them by date and time
        const appointments = await Appointment.find(searchQuery).sort({ date: 1, startTime: 1 });
        
        // Return the list of appointments
        return commonUtils.sendSuccessResponse(req, res, "Appointments retrieved successfully.", appointments);
    } catch (error) {
        return commonUtils.sendErrorResponse(req, res, error.message, null, 500);
    }
};

// ==========================================
// 2. Get Single Appointment Details
// ==========================================
const getAppointmentDetails = async (req, res) => {
    try {
        // Get the appointment ID from the URL (e.g., /appointments/12345)
        const appointmentId = req.params.id;
        
        // Find the appointment that matches the ID and belongs to this doctor
        const appointment = await Appointment.findOne({ 
            _id: appointmentId, 
            doctorId: req.userId 
        });
        
        // If no appointment is found, send an error
        if (!appointment) {
            return commonUtils.sendErrorResponse(req, res, "Appointment not found.", null, 404);
        }

        // Return the appointment details
        return commonUtils.sendSuccessResponse(req, res, "Appointment details retrieved.", appointment);
    } catch (error) {
        return commonUtils.sendErrorResponse(req, res, error.message, null, 500);
    }
};

// ==========================================
// 3. Update Appointment Status (Accept, Reject, Cancel)
// ==========================================
const updateAppointmentStatus = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        let newStatus = req.body.status; 
        
        // Make sure the status is in uppercase letters
        if (newStatus) {
            newStatus = newStatus.toUpperCase();
        }

        // Check if the new status is allowed
        const allowedStatuses = ["ACCEPTED", "REJECTED", "CANCELLED"];
        if (!allowedStatuses.includes(newStatus)) {
            return commonUtils.sendErrorResponse(req, res, "Invalid status. Please use ACCEPTED, REJECTED, or CANCELLED.", null, 400);
        }

        // Find the appointment
        const appointment = await Appointment.findOne({ 
            _id: appointmentId, 
            doctorId: req.userId 
        });
        
        if (!appointment) {
            return commonUtils.sendErrorResponse(req, res, "Appointment not found.", null, 404);
        }

        // Do not allow changes if the appointment is already completed
        if (appointment.status === "COMPLETED") {
             return commonUtils.sendErrorResponse(req, res, "Cannot update an appointment that is already completed.", null, 400);
        }

        // Update the status and save it to the database
        appointment.status = newStatus;
        await appointment.save();

        return commonUtils.sendSuccessResponse(req, res, `Appointment status updated to ${newStatus}.`, appointment);
    } catch (error) {
        return commonUtils.sendErrorResponse(req, res, error.message, null, 500);
    }
};

// ==========================================
// 4. Reschedule Appointment
// ==========================================
const rescheduleAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const { newDate, newStartTime, newEndTime } = req.body;

        // Find the appointment
        const appointment = await Appointment.findOne({ 
            _id: appointmentId, 
            doctorId: req.userId 
        });
        
        if (!appointment) {
            return commonUtils.sendErrorResponse(req, res, "Appointment not found.", null, 404);
        }

        // If the appointment is completed, cancelled, or rejected, it cannot be rescheduled
        const blockedStatuses = ["COMPLETED", "CANCELLED", "REJECTED"];
        if (blockedStatuses.includes(appointment.status)) {
             return commonUtils.sendErrorResponse(req, res, "Cannot reschedule completed, cancelled, or rejected appointments.", null, 400);
        }

        // --- Check the 60 minutes rule ---
        
        // 1. Combine the existing date and start time into one string (e.g., "2024-10-15 09:00")
        const appointmentDateTimeString = `${appointment.date} ${appointment.startTime}`;
        
        // 2. Convert that string into a Moment object so we can calculate time differences
        const appointmentMoment = moment(appointmentDateTimeString, "YYYY-MM-DD HH:mm");
        
        // 3. Get the current time right now
        const currentMoment = moment();

        // 4. Calculate how many minutes are left until the appointment starts
        const minutesUntilAppointment = appointmentMoment.diff(currentMoment, 'minutes');

        // Check if the appointment has already started or passed
        if (minutesUntilAppointment <= 0) {
            return commonUtils.sendErrorResponse(req, res, "Cannot reschedule an appointment that has already started or passed.", null, 403);
        }

        // Check if it is less than or equal to 60 minutes away
        if (minutesUntilAppointment <= 60) {
            return commonUtils.sendErrorResponse(req, res, "Appointments starting within 60 minutes cannot be rescheduled.", null, 403);
        }

        // --- Update the appointment with new details ---
        
        if (newDate) {
            appointment.date = newDate;
        }
        if (newStartTime) {
            appointment.startTime = newStartTime;
        }
        if (newEndTime) {
            appointment.endTime = newEndTime;
        }
        
        // Change the status back to UPCOMING since it has been given a new time
        appointment.status = "UPCOMING"; 
        
        // Save the changes to the database
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
