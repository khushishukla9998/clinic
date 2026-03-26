const Leave = require("../model/leaveModal");
const commonUtils = require("../../utils/commonUtils");
const appStrings = require("../../utils/appString");
const appString = require("../../utils/appString");

// ================= TIME CONVERTER =================
const toMinutes = (timeString) => {
    if (!timeString) return 0;
    const [hours, minutes] = timeString.split(":").map(Number);
    return (hours * 60) + minutes;
};

// ================= CATEGORY DETECTOR =================
const getLeaveCategory = (slots) => {

    // Full Day
    if (!slots || slots.length === 0) {
        return appStrings.FULL_DAY;
    }

    let totalMinutes = 0;

    for (let slot of slots) {
        const start = toMinutes(slot.startTime);
        const end = toMinutes(slot.endTime);
        totalMinutes += (end - start);
    }

    // Half Day (4 hours)
    if (totalMinutes === 240) {
        return appString.HALF_DAY;
    }

    // Custom
    return appString.CUSTOM;
};

// ================= REQUEST LEAVE =================
const requestLeave = async (req, res) => {
    try {
        const { unavailableDates, leaveType, reason } = req.body;


        if (!unavailableDates || Object.keys(unavailableDates).length === 0) {
            return commonUtils.sendErrorResponse(
                req,
                res,
                appString.PROVIDE_DATE,
                null,
                400
            );
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let updateQuery = {};

        // ================= LOOP EACH DATE =================
        for (let date in unavailableDates) {

            const leaveDate = new Date(date);

            const diffDays = (leaveDate - today) / (1000 * 60 * 60 * 24);


            if (diffDays < 3) {
                return commonUtils.sendErrorResponse(
                    req,
                    res,
                    `You must apply for leave at least 3 days in advance (${date} is too soon).`,
                    null,
                    400
                );
            }

            const slots = unavailableDates[date];


            const category = getLeaveCategory(slots);


            // ================= CHECK EXISTING =================

            const existing = await Leave.findOne({
                doctorId: req.userId,
                [`unavailableDates.${date}`]: { $exists: true }
            });

            if (existing) {

                const existingData = existing.unavailableDates.get(date);


                if (!existingData.slots || existingData.slots.length === 0) {
                    return res.status(400).json({
                        message: `Full day already booked on ${date}`
                    });
                }

                if (!slots || slots.length === 0) {
                    return commonUtils.sendErrorResponse(req, res, appString.CAN_NOT_BOOK)

                }


                for (let newSlot of slots) {
                    for (let oldSlot of existingData.slots) {

                        const s1 = toMinutes(newSlot.startTime);
                        const e1 = toMinutes(newSlot.endTime);
                        const s2 = toMinutes(oldSlot.startTime);
                        const e2 = toMinutes(oldSlot.endTime);

                        if (s1 < e2 && s2 < e1) {
                            return res.status(400).json({
                                message: `Time conflict on ${date}`
                            });
                        }
                    }
                }


                const mergedSlots = [...existingData.slots, ...slots];

                updateQuery[`unavailableDates.${date}`] = {
                    slots: mergedSlots,
                    category: getLeaveCategory(mergedSlots)
                };

            } else {


                updateQuery[`unavailableDates.${date}`] = {
                    slots: slots || [],
                    category
                };
            }
        }


        const leave = await Leave.findOneAndUpdate(
            { doctorId: req.userId },
            {
                $set: {
                    ...updateQuery,
                    leaveType,
                    reason
                }
            },
            {
                new: true,
                upsert: true
            }
        );

        return commonUtils.sendSuccessResponse(
            req,
            res,
            appString.LEAVE_SUCCESS,
            leave
        );

    } catch (err) {
        return commonUtils.sendErrorResponse(req, res, err.message, null, 500);
    }
};

module.exports = {
    requestLeave
};