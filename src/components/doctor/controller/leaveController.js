const Leave = require("../model/leaveModal");
const commonUtils = require("../../utils/commonUtils");

// ==========================================
// Helper: Convert "HH:mm" time string to total minutes
// For example, "09:30" becomes 570 (9*60 + 30)
// ==========================================
const toMinutes = (timeString) => {
    if (!timeString) return 0;
    const [hours, minutes] = timeString.split(":").map(Number);
    return (hours * 60) + minutes;
};

// ==========================================
// Request Leave
// ==========================================
const requestLeave = async (req, res) => {
    try {
        const { unavailableDates, leaveType, reason } = req.body;
        
        // 1. Basic Validation
        if (!unavailableDates || Object.keys(unavailableDates).length === 0) {
             return commonUtils.sendErrorResponse(req, res, "Please provide the dates you will be unavailable.", null, 400);
        }

        const today = new Date();
        // Reset today's time to midnight to compare only dates properly
        today.setHours(0, 0, 0, 0);

        // 2. Loop over each requested date to check rules and conflicts
        for (let dateString in unavailableDates) {
            const leaveDate = new Date(dateString);
            
            // --- Rule A: Must apply at least 3 days in advance ---
            const differenceInTime = leaveDate.getTime() - today.getTime();
            const differenceInDays = differenceInTime / (1000 * 3600 * 24);
            
            if (differenceInDays < 3) {
                return commonUtils.sendErrorResponse(req, res, `You must apply for leave at least 3 days in advance (${dateString} is too soon).`, null, 400);
            }

            const requestedSlots = unavailableDates[dateString];

            // --- Rule B: Check for existing conflicting leaves on this date ---
            // Find if this doctor already has a piece of leave submitted that touches this date
            const existingLeave = await Leave.findOne({
                doctorId: req.userId,
                [`unavailableDates.${dateString}`]: { $exists: true }
            });

            if (existingLeave) {
                // Get the time slots the doctor already booked off for this date
                const alreadyBookedSlots = existingLeave.unavailableDates.get(dateString);

                // If they already took the whole day off, they cannot ask for more time off
                if (!alreadyBookedSlots || alreadyBookedSlots.length === 0) {
                    return commonUtils.sendErrorResponse(req, res, `You have already booked a full day off on ${dateString}.`, null, 400);
                }

                // If they are trying to book a full day off now, but already booked partial slots
                if (!requestedSlots || requestedSlots.length === 0) {
                    return commonUtils.sendErrorResponse(req, res, `Cannot apply for a full day off on ${dateString} because you already have partial time off booked.`, null, 400);
                }

                // Check specifically if the new requested times overlap the already booked times
                for (let newSlot of requestedSlots) {
                    for (let oldSlot of alreadyBookedSlots) {
                        const newStart = toMinutes(newSlot.startTime);
                        const newEnd = toMinutes(newSlot.endTime);
                        
                        const oldStart = toMinutes(oldSlot.startTime);
                        const oldEnd = toMinutes(oldSlot.endTime);

                        // Checking Overlap Logic
                        if (newStart < oldEnd && oldStart < newEnd) {
                            return commonUtils.sendErrorResponse(req, res, `There is a time conflict with a previously requested leave on ${dateString}.`, null, 400);
                        }
                    }
                }
            }
        }

        // 3. Save the Leave Request to the database
        const newLeave = await Leave.create({
            doctorId: req.userId, // Use req.userId created securely by the auth middleware
            unavailableDates,
            leaveType,
            reason
        });

        return commonUtils.sendSuccessResponse(req, res, "Leave request submitted successfully.", newLeave);

    } catch (err) {
        return commonUtils.sendErrorResponse(req, res, err.message, null, 500);
    }
};

module.exports = {
    requestLeave
};
