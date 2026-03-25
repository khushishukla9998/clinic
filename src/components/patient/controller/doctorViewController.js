const Doctor = require("../../doctor/model/doctorModel");
const Leave = require("../../doctor/model/leaveModal");
const ENUM = require("../../utils/enum");
const commonUtils = require("../../utils/commonUtils");
const appString = require("../../utils/appString");


//===================== List Doctors with Filters ==================================//

const getDoctors = async (req, res) => {
    try {
        const { search, availableDay, page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        let query = {
            isAccountVerified: ENUM.ACCOUNT_VERIFIED_STATUS.VERIFIED,
            isDeleted: ENUM.IS_DELETED.NOT_DELETED,
        };

        if (search) {
            query.name = { $regex: search, $options: "i" };
        }


         if (availableDay) {
            const dayLower = availableDay.toLowerCase();
            doctors = doctors.filter(doc => {
             
                const step3 = doc.steps?.find(s => s.data && s.data.stepKey === "step3");
                if (!step3 || !step3.data || !step3.data.availableTimeSlots) return false;

                const slots = step3.data.availableTimeSlots;
            
                return slots.some(slot => slot.day && slot.day.toLowerCase() === dayLower);
            });
        }
        const total = await Doctor.countDocuments(query);
        console.log(query)
    
        let doctors = await Doctor.find(query)
            .select("-password -otp -otpExpire -emailOtp -emailOtpExpire -emailOtpLastSend -mobileOtpLastSend -steps")
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 });


        console.log(doctors)

        return commonUtils.sendSuccessResponse(req, res, appString.DOCTOR_GET, {
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
            doctors
        });
    } catch (error) {
        console.error("Error fetching doctors:", error);
        return commonUtils.sendErrorResponse(req, res, error.message, null, 500);
    }
};


//===================== Get Doctor Profile ==================================//

const getDoctorProfile = async (req, res) => {
    try {
        const doctorId = req.params.id;

        console.log(doctorId)

        const doctor = await Doctor.findOne({
            _id: doctorId,
            isAccountVerified: ENUM.ACCOUNT_VERIFIED_STATUS.VERIFIED,
            isDeleted: ENUM.IS_DELETED.NOT_DELETED,
        }).select("-password -otp -otpExpire -emailOtp -emailOtpExpire -emailOtpLastSend -mobileOtpLastSend");


        console.log(doctor)


        if (!doctor) {
            return commonUtils.sendErrorResponse(req, res, appString.DOCTOR_NOT_FOUND, null, 404);
        }


        let profile = {
            id: doctor._id,
            name: doctor.name,
            email: doctor.email,
            mobileNo: doctor.mobileNo,
            country: doctor.country,
            countryCode: doctor.countryCode,
            appointmentsCharges: doctor.appointmentsCharges,
            documents: null,
            qualifications: null,
            experience: null,
            availableTimeSlots: null,
        };


        if (doctor.steps && doctor.steps.length > 0) {
            for (const step of doctor.steps) {
                if (!step.data) continue;
                switch (step.data.stepKey) {
                    case "step1":
                        profile.documents = step.data.documents || null;
                        break;
                    case "step3":
                        profile.availableTimeSlots = step.data.availableTimeSlots || null;
                        break;
                    case "step4":
                        profile.qualifications = step.data.qualifications || null;
                        break;
                    case "step5":
                        profile.experience = step.data.experienceDetails || null;
                        break;
                }
            }
        }
      const leaves = await Leave.find({
            doctorId: doctorId,
            leaveStatus: ENUM.LEAVE_STATUS.APPROVED,
        });

        profile.approvedLeaves = leaves.map(l => ({
            leaveType: l.leaveType,
            unavailableDates: l.unavailableDates,
        }));

        return commonUtils.sendSuccessResponse(req, res, appString.DOCTOR_PROFILE_GET, profile);
    } catch (error) {
        return commonUtils.sendErrorResponse(req, res, error.message, null, 500);
    }
};


module.exports = { getDoctors, getDoctorProfile };
