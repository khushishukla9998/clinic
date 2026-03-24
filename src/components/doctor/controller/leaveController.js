// const Leave = require("../model/leaveModal");
// const commonUtils = require("../../utils/commonUtils");


// const toMinutes = (timeString) => {
//     if (!timeString) return 0;
//     const [hours, minutes] = timeString.split(":").map(Number);
//     return (hours * 60) + minutes;
// };

// // ============== Request Leave============================


// const getLeaveCategory = (slots) => {
//     // Full Day
//     if (!slots || slots.length === 0) {
//         return "full_day";
//     }

//     let totalMinutes = 0;

//     for (let slot of slots) {
//         const start = toMinutes(slot.startTime);
//         const end = toMinutes(slot.endTime);

//         totalMinutes += (end - start);
//     }

//     // Half Day 
//     if (totalMinutes === 240) {
//         return "half_day";
//     }

//     // Custom
//     return "custom";
// };


// //===========

// // const requestLeave = async (req, res) => {
// //     try {
// //         const { unavailableDates, leaveType, reason } = req.body;

// //         if (!unavailableDates || Object.keys(unavailableDates).length === 0) {
// //             return commonUtils.sendErrorResponse(req, res, "Please provide the dates you will be unavailable.", null, 400);
// //         }

// //         const today = new Date();

// //         today.setHours(0, 0, 0, 0);


// //         for (let date in unavailableDates) {
// //             const leaveDate = new Date(date);


// //             const differenceInTime = leaveDate.getTime() - today.getTime();
// //             const differenceInDays = differenceInTime / (1000 * 60 * 60 * 24);

// //             if (differenceInDays < 3) {
// //                 return commonUtils.sendErrorResponse(req, res, `You must apply for leave at least 3 days in advance (${date} is too soon).`, null, 400);
// //             }



// //             const slots = unavailableDates[date];
// //             console.log(slots)


// //             const category = getLeaveCategory(slots);


// //             console.log(`Leave on ${date}: ${category}`);
// //             console.log("hiiiiiiiiiiiiiiii", category)

// //             const existing = await Leave.findOne({
// //                 doctorId: req.id,
// //                 [`unavailableDates.${date}`]: { $exists: true }
// //             });

// //             if (existing) {
// //                 const existingSlots = existing.unavailableDates.get(date);

// //                 if (!existingSlots || existingSlots.length === 0) {
// //                     return res.status(400).json({
// //                         message: `Full day already booked on ${date}`
// //                     });
// //                 }


// //                 if (!slots || slots.length === 0) {
// //                     return res.status(400).json({
// //                         message: `Cannot apply full day, slots already exist`
// //                     });
// //                 }


// //                 for (let newSlot of slots) {
// //                     for (let oldSlot of existingSlots) {

// //                         const s1 = toMinutes(newSlot.startTime);
// //                         const e1 = toMinutes(newSlot.endTime);
// //                         const s2 = toMinutes(oldSlot.startTime);
// //                         const e2 = toMinutes(oldSlot.endTime);

// //                         if (s1 < e2 && s2 < e1) {
// //                             return res.status(400).json({
// //                                 message: `Time conflict on ${date}`
// //                             });
// //                         }
// //                     }
// //                 }
// //             }
// //         }
// //         const newLeave = await Leave.create({
// //             doctorId: req.userId,
// //             unavailableDates,
// //             leaveType,
// //             reason,

// //         });

// //         return commonUtils.sendSuccessResponse(req, res, "Leave request submitted successfully.", newLeave);

// //     } catch (err) {
// //         return commonUtils.sendErrorResponse(req, res, err.message, null, 500);
// //     }
// // };

// // module.exports = {
// //     requestLeave
// // };
// let formattedDates = {};

// for (let date in unavailableDates) {

//     const slots = unavailableDates[date];

  
//     const category = getLeaveCategory(slots);

   
//     const existing = await Leave.findOne({
//         doctorId: req.userId,
//         [`unavailableDates.${date}`]: { $exists: true }
//     });

//     if (existing) {
//         const existingData = existing.unavailableDates.get(date);

//         if (!existingData.slots || existingData.slots.length === 0) {
//             return res.status(400).json({
//                 message: `Full day already booked on ${date}`
//             });
//         }

//         if (!slots || slots.length === 0) {
//             return res.status(400).json({
//                 message: `Cannot apply full day, slots already exist`
//             });
//         }

      
//         for (let newSlot of slots) {
//             for (let oldSlot of existingData.slots) {

//                 const s1 = toMinutes(newSlot.startTime);
//                 const e1 = toMinutes(newSlot.endTime);
//                 const s2 = toMinutes(oldSlot.startTime);
//                 const e2 = toMinutes(oldSlot.endTime);

//                 if (s1 < e2 && s2 < e1) {
//                     return res.status(400).json({
//                         message: `Time conflict on ${date}`
//                     });
//                 }
//             }
//         }

        
//         const mergedSlots = [...existingData.slots, ...slots];

//         formattedDates[date] = {
//             slots: mergedSlots,
//             category: getLeaveCategory(mergedSlots)
//         };

//     } else {
      
//         formattedDates[date] = {
//             slots: slots || [],
//             category
//         };
//     }
// }




const Leave = require("../model/leaveModal");
const commonUtils = require("../../utils/commonUtils");

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
        return "full_day";
    }

    let totalMinutes = 0;

    for (let slot of slots) {
        const start = toMinutes(slot.startTime);
        const end = toMinutes(slot.endTime);
        totalMinutes += (end - start);
    }

    // Half Day (4 hours)
    if (totalMinutes === 240) {
        return "half_day";
    }

    // Custom
    return "custom";
};

// ================= REQUEST LEAVE =================
const requestLeave = async (req, res) => {
    try {
        const { unavailableDates, leaveType, reason } = req.body;

    
        if (!unavailableDates || Object.keys(unavailableDates).length === 0) {
            return commonUtils.sendErrorResponse(
                req,
                res,
                "Please provide the dates you will be unavailable.",
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

                // Full day already applyyyed
                if (!existingData.slots || existingData.slots.length === 0) {
                    return res.status(400).json({
                        message: `Full day already booked on ${date}`
                    });
                }

                // rying full day when slots exist
                if (!slots || slots.length === 0) {
                    return res.status(400).json({
                        message: `Cannot apply full day, slots already exist`
                    });
                }

                //  SLOT CONFLICT CHECK
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

                //  RECALCULATE CATEGORY
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

        // ================= UPSERT =================
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
            "Leave request processed successfully.",
            leave
        );

    } catch (err) {
        return commonUtils.sendErrorResponse(req, res, err.message, null, 500);
    }
};

module.exports = {
    requestLeave
};