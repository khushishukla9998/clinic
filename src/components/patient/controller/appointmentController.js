const Appointment = require("../../doctor/model/appointmentModel");
const Doctor = require("../../doctor/model/doctorModel");
const Leave = require("../../doctor/model/leaveModal");
const ENUM = require("../../utils/enum");
const commonUtils = require("../../utils/commonUtils");
const moment = require("moment");
const appString = require("../../utils/appString");


//===================== Get Available Slots ==================================//

const getAvailableSlots = async (req, res) => {
    try {
        const doctorId = req.params.id;
        console.log(doctorId)
        const { date, duration = 30 } = req.query; 
        let query = {
                    id: doctorId,
                    isAccountVerified: ENUM.ACCOUNT_VERIFIED_STATUS.VERIFIED,
                    isDeleted: ENUM.IS_DELETED.NOT_DELETED,
                };

        if (!date) {
            return commonUtils.sendErrorResponse(req, res,appString.DATE_REQUIRED , null, 400);
        }

        if (!moment(date, "YYYY-MM-DD", true).isValid()) {
            return commonUtils.sendErrorResponse(req, res, appString.INVALI_DATE, null, 400);
        }

    
        if (moment(date, "YYYY-MM-DD").isBefore(moment().startOf("day"))) {
            return commonUtils.sendErrorResponse(req, res,appString.PAST_SLOT , null, 400);
        }

        // const doctor = await Doctor.findOne({id: doctorId,isAccountVerified: ENUM.ACCOUNT_VERIFIED_STATUS.VERIFIED,isDeleted: ENUM.IS_DELETED.NOT_DELETED});

            let doctor = await Doctor.find(query)
        console.log(doctor)
        if (!doctor) {
            return commonUtils.sendErrorResponse(req, res, appString.DOCTOR_NOT_FOUND, null, 404);
        }

        const dayName = moment(date, "YYYY-MM-DD").format("dddd"); // e.g., "Monday"

  
        const step3 = doctor.steps?.find(s => s.data && s.data.stepKey === "step3");
        if (!step3 || !step3.data || !step3.data.availableTimeSlots) {
            return commonUtils.sendErrorResponse(req, res,appString.NOT_AVAILBLE_SLOT , null, 400);
        }

    
        const daySlots = step3.data.availableTimeSlots.filter(
            slot => slot.day && slot.day.toLowerCase() === dayName.toLowerCase()
        );

        if (daySlots.length === 0) {
            return commonUtils.sendSuccessResponse(req, res, appString.NOT_AVAILBLE_DAY, { availableSlots: [] });
        }

        
        const leaves = await Leave.find({
            doctorId: doctorId,
            leaveStatus: ENUM.LEAVE_STATUS.APPROVED,
        });

        let isOnFullDayLeave = false;
        let leaveSlots = []; 

        for (const leave of leaves) {
            if (leave.unavailableDates && leave.unavailableDates instanceof Map) {
                const dateLeave = leave.unavailableDates.get(date);
                if (dateLeave) {
                    if (dateLeave.category === appString.FULL_DAY) {
                        isOnFullDayLeave = true;
                        break;
                    }
                    if (dateLeave.slots && dateLeave.slots.length > 0) {
                        leaveSlots.push(...dateLeave.slots);
                    }
                }
            }
        }

        if (isOnFullDayLeave) {
            return commonUtils.sendSuccessResponse(req, res,appString.ON_LEAVE, { availableSlots: [] });
        }

     
        const existingAppointments = await Appointment.find({
            doctorId: doctorId,
            date: date,
            status: { $nin: ["CANCELLED", "REJECTED"] }
        });

      
        const slotDuration = Number(duration);
        let availableSlots = [];

        for (const daySlot of daySlots) {
            const slotStart = moment(daySlot.startTime, "HH:mm");
            const slotEnd = moment(daySlot.endTime, "HH:mm");

            let current = slotStart.clone();

            while (current.clone().add(slotDuration, "minutes").isSameOrBefore(slotEnd)) {
                const candidateStart = current.format("HH:mm");
                const candidateEnd = current.clone().add(slotDuration, "minutes").format("HH:mm");

             
                const isBooked = existingAppointments.some(appt => {
                    const apptStart = moment(appt.startTime, "HH:mm");
                    const apptEnd = moment(appt.endTime, "HH:mm");
                    const candStart = moment(candidateStart, "HH:mm");
                    const candEnd = moment(candidateEnd, "HH:mm");
                    return candStart.isBefore(apptEnd) && candEnd.isAfter(apptStart);
                });

            
                const isOnLeave = leaveSlots.some(ls => {
                    const lsStart = moment(ls.startTime, "HH:mm");
                    const lsEnd = moment(ls.endTime, "HH:mm");
                    const candStart = moment(candidateStart, "HH:mm");
                    const candEnd = moment(candidateEnd, "HH:mm");
                    return candStart.isBefore(lsEnd) && candEnd.isAfter(lsStart);
                });

                if (!isBooked && !isOnLeave) {
                    availableSlots.push({
                        startTime: candidateStart,
                        endTime: candidateEnd,
                    });
                }

                current.add(slotDuration, "minutes");
            }
        }

        return commonUtils.sendSuccessResponse(req, res, "Available slots retrieved successfully.", {
            doctorId,
            date,
            duration: slotDuration,
            availableSlots,
        });
    } catch (error) {
        return commonUtils.sendErrorResponse(req, res, error.message, null, 500);
    }
};


//===================== Book Appointment ==================================//

const bookAppointment = async (req, res) => {
    try {
        const { doctorId, date, startTime, endTime } = req.body;
        const patientId = req.userId;
        

        if (!doctorId || !date || !startTime || !endTime) {
            return commonUtils.sendErrorResponse(req, res, "doctorId, date, startTime, and endTime are required.", null, 400);
        }


        if (!moment(date, "YYYY-MM-DD", true).isValid()) {
            return commonUtils.sendErrorResponse(req, res, appString.INVALI_DATE, null, 400);
        }

  
        if (moment(date, "YYYY-MM-DD").isBefore(moment().startOf("day"))) {
            return commonUtils.sendErrorResponse(req, res,appString.PAST_APPOINTMENTS , null, 400);
        }


        const doctor = await Doctor.findOne({
            _id: doctorId,
            isAccountVerified: ENUM.ACCOUNT_VERIFIED_STATUS.VERIFIED,
            isDeleted: ENUM.IS_DELETED.NOT_DELETED,
        });

        if (!doctor) {
            return commonUtils.sendErrorResponse(req, res,appString.DOCTOR_NOT, null, 404);
        }

      
        const overlapping = await Appointment.findOne({
            doctorId,
            date,
            status: { $nin: ["CANCELLED", "REJECTED"] },
            $or: [
                {
                    startTime: { $lt: endTime },
                    endTime: { $gt: startTime }
                }
            ]
        });

        if (overlapping) {
            return commonUtils.sendErrorResponse(
                req, res,
               appString.ALREADY_BOOK,
                null, 409
            );
        }
        const leaves = await Leave.find({
            doctorId,
            leaveStatus: ENUM.LEAVE_STATUS.APPROVED,
        });

        for (const leave of leaves) {
            if (leave.unavailableDates && leave.unavailableDates instanceof Map) {
                const dateLeave = leave.unavailableDates.get(date);
                if (dateLeave) {
                    if (dateLeave.category === appString.FULL_DAY) {
                        return commonUtils.sendErrorResponse(req, res,appString.DOCTOR_ON_LEAVE_DAY , null, 400);
                    }
                    if (dateLeave.slots && dateLeave.slots.length > 0) {
                        const isOnLeave = dateLeave.slots.some(ls => {
                            const lsStart = moment(ls.startTime, "HH:mm");
                            const lsEnd = moment(ls.endTime, "HH:mm");
                            const bkStart = moment(startTime, "HH:mm");
                            const bkEnd = moment(endTime, "HH:mm");
                            return bkStart.isBefore(lsEnd) && bkEnd.isAfter(lsStart);
                        });
                        if (isOnLeave) {
                            return commonUtils.sendErrorResponse(req, res,appString.DOCTOE_ON_LEAVE_TIMEsLOT, null, 400);
                        }
                    }
                }
            }
        }
        const appointmentCharge = doctor.appointmentsCharges || 0;

        const appointment = new Appointment({
            doctorId,
            patientId,
            date,
            startTime,
            endTime,
            status: "PENDING",
            appointmentCharge,
        });

        await appointment.save();

        return commonUtils.sendSuccessResponse(req, res,appString.APPOINTMENT_BOOK, appointment, 201);
    } catch (error) {
        return commonUtils.sendErrorResponse(req, res, error.message, null, 500);
    }
};


//===================== Get Patient Appointments ==================================//

const getAppointments = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        let searchQuery = {
            patientId: req.userId
        };

        if (status) {
            searchQuery.status = status.toUpperCase();
        }

        const appointments = await Appointment.find(searchQuery)
            .populate("doctorId", "name email mobileNo appointmentsCharges")
            .sort({ date: 1, startTime: 1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await Appointment.countDocuments(searchQuery);

        return commonUtils.sendSuccessResponse(req, res, "Appointments retrieved successfully.", {
            appointments,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            }
        });
    } catch (error) {
        return commonUtils.sendErrorResponse(req, res, error.message, null, 500);
    }
};


//===================== Get Appointment Details ==================================//

const getAppointmentDetails = async (req, res) => {
    try {
        const appointmentId = req.params.id;

        const appointment = await Appointment.findOne({
            _id: appointmentId,
            patientId: req.userId
        }).populate("doctorId", "name email mobileNo country appointmentsCharges");

        if (!appointment) {
            return commonUtils.sendErrorResponse(req, res, "Appointment not found.", null, 404);
        }

        return commonUtils.sendSuccessResponse(req, res, "Appointment details retrieved.", appointment);
    } catch (error) {
        return commonUtils.sendErrorResponse(req, res, error.message, null, 500);
    }
};


//===================== Reschedule Appointment ==================================//

const rescheduleAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const { newDate, newStartTime, newEndTime } = req.body;

        const appointment = await Appointment.findOne({
            _id: appointmentId,
            patientId: req.userId
        });

        if (!appointment) {
            return commonUtils.sendErrorResponse(req, res, "Appointment not found.", null, 404);
        }

        const blockedStatuses = ["COMPLETED", "CANCELLED", "REJECTED"];
        if (blockedStatuses.includes(appointment.status)) {
            return commonUtils.sendErrorResponse(req, res, "Cannot reschedule completed, cancelled, or rejected appointments.", null, 400);
        }

        // Check 60-minute 
        const appointmentDateTimeString = `${appointment.date} ${appointment.startTime}`;
        const appointmentMoment = moment(appointmentDateTimeString, "YYYY-MM-DD HH:mm");
        const currentMoment = moment();
        const minutesUntilAppointment = appointmentMoment.diff(currentMoment, "minutes");

        if (minutesUntilAppointment <= 0) {
            return commonUtils.sendErrorResponse(req, res, "Cannot reschedule an appointment that has already started or passed.", null, 403);
        }

        if (minutesUntilAppointment <= 60) {
            return commonUtils.sendErrorResponse(req, res, "Appointments starting within 60 minutes cannot be rescheduled.", null, 403);
        }

     
        const finalDate = newDate || appointment.date;
        const finalStartTime = newStartTime || appointment.startTime;
        const finalEndTime = newEndTime || appointment.endTime;

 
        const overlapping = await Appointment.findOne({
            doctorId: appointment.doctorId,
            date: finalDate,
            _id: { $ne: appointmentId },
            status: { $nin: ["CANCELLED", "REJECTED"] },
            $or: [
                {
                    startTime: { $lt: finalEndTime },
                    endTime: { $gt: finalStartTime }
                }
            ]
        });

        if (overlapping) {
            return commonUtils.sendErrorResponse(req, res, "The new time slot is already booked. Please choose a different time.", null, 409);
        }

        appointment.date = finalDate;
        appointment.startTime = finalStartTime;
        appointment.endTime = finalEndTime;
        appointment.status = "UPCOMING";
        await appointment.save();

        return commonUtils.sendSuccessResponse(req, res, "Appointment rescheduled successfully.", appointment);
    } catch (error) {
        return commonUtils.sendErrorResponse(req, res, error.message, null, 500);
    }
};


//===================== Cancel Appointment ==================================//

const cancelAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.id;

        const appointment = await Appointment.findOne({
            _id: appointmentId,
            patientId: req.userId
        });

        if (!appointment) {
            return commonUtils.sendErrorResponse(req, res, "Appointment not found.", null, 404);
        }

        const blockedStatuses = ["COMPLETED", "CANCELLED", "REJECTED"];
        if (blockedStatuses.includes(appointment.status)) {
            return commonUtils.sendErrorResponse(req, res, `Cannot cancel an appointment that is already ${appointment.status.toLowerCase()}.`, null, 400);
        }

        appointment.status = "CANCELLED";
        await appointment.save();

        return commonUtils.sendSuccessResponse(req, res, "Appointment cancelled successfully.", appointment);
    } catch (error) {
        return commonUtils.sendErrorResponse(req, res, error.message, null, 500);
    }
};


module.exports = {
    getAvailableSlots,
    bookAppointment,
    getAppointments,
    getAppointmentDetails,
    rescheduleAppointment,
    cancelAppointment,
};
