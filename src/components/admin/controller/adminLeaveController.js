const Leave = require("../../doctor/model/leaveModal");
const appString = require("../../utils/appString");
const commonUtils = require("../../utils/commonUtils");
const ENUM = require("../../utils/enum")


// ==========================================
const getAllLeaves = async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};
        if (status) {
            query.leaveStatus = status.toUpperCase();
        }
        const leaves = await Leave.find(query)
            .populate("doctorId", "name email mobile")
            .sort({ createdAt: -1 });

        return commonUtils.sendSuccessResponse(req, res, appString.LEAVE_FETCHED, leaves);
    } catch (error) {
        return commonUtils.sendErrorResponse(req, res, error.message, null, 500);
    }
};


// Update Leave

const updateLeaveStatus = async (req, res) => {
    try {
        const leaveId = req.params.id;
        const { status, rejectionReason } = req.body;

        if (!status) {
            return commonUtils.sendErrorResponse(req, res, appString.PROVIDE_STATUS, null, 400);
        }
        const leave = await Leave.findById(leaveId);

        if (!leave) {
            return commonUtils.sendErrorResponse(req, res, appString.LEAVE_NOT_FOUND, null, 404);
        }
        const validStatuses = [ENUM.LEAVE_STATUS.APPROVED || ENUM.LEAVE_STATUS.REJECTED];
        const newStatus = status;

        if (!validStatuses) {
            return commonUtils.sendErrorResponse(req, res, appString.INVALID_STATUS, null, 400);
        }

        if (newStatus === ENUM.LEAVE_STATUS.REJECTED && !rejectionReason) {
            return commonUtils.sendErrorResponse(req, res, appString.REJECTION_REASON, null, 400);
        }

        if (leave.leaveStatus !== ENUM.LEAVE_STATUS.PENDING) {
            return commonUtils.sendErrorResponse(req, res, appString.LEAVE_ALREADY, null, 400);
        }

        leave.leaveStatus = newStatus;

        if (newStatus === ENUM.LEAVE_STATUS.REJECTED) {
            leave.rejectionReason = rejectionReason;
        }
 const message = doctor.isAccountVerified === ENUM.ACCOUNT_VERIFIED_STATUS.VERIFIED
            ? "Doctor leave  has been granted access."
            : "Doctor leave has been rejected.";

        await leave.save();

        return commonUtils.sendSuccessResponse(req, res, message, leave);

    } catch (error) {
        return commonUtils.sendErrorResponse(req, res, error.message, null, 500);
    }
};

module.exports = {
    getAllLeaves,
    updateLeaveStatus
};
