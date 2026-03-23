const Leave = require("../../doctor/model/leaveModal");
const commonUtils = require("../../utils/commonUtils");

// ==========================================
// 1. Get All Leave Requests (for Admin)
// ==========================================
const getAllLeaves = async (req, res) => {
    try {
        const { status } = req.query; // PENDING, APPROVED, REJECTED
        
        // Build the basic query
        let query = {};
        
        // Filter by status if the admin requests it
        if (status) {
            query.leaveStatus = status.toUpperCase();
        }

        // Find leaves and populate the doctor's basic information so the admin knows who is applying
        const leaves = await Leave.find(query)
            .populate("doctorId", "name email mobile specialty")
            .sort({ createdAt: -1 }); // Newest requests first

        return commonUtils.sendSuccessResponse(req, res, "Leave requests retrieved successfully.", leaves);
    } catch (error) {
        return commonUtils.sendErrorResponse(req, res, error.message, null, 500);
    }
};

// ==========================================
// 2. Update Leave Status (Accept or Reject)
// ==========================================
const updateLeaveStatus = async (req, res) => {
    try {
        const leaveId = req.params.id;
        const { status, rejectionReason } = req.body;
        
        // Basic validation
        if (!status) {
            return commonUtils.sendErrorResponse(req, res, "Please provide the new status (APPROVED or REJECTED).", null, 400);
        }

        const validStatuses = ["APPROVED", "REJECTED"];
        const newStatus = status.toUpperCase();

        if (!validStatuses.includes(newStatus)) {
            return commonUtils.sendErrorResponse(req, res, "Invalid status. Use APPROVED or REJECTED.", null, 400);
        }

        // If the admin is rejecting, we must enforce giving a reason!
        if (newStatus === "REJECTED" && !rejectionReason) {
            return commonUtils.sendErrorResponse(req, res, "A rejection reason must be provided when rejecting a leave request.", null, 400);
        }

        // Find the specific leave request
        const leave = await Leave.findById(leaveId);
        
        if (!leave) {
            return commonUtils.sendErrorResponse(req, res, "Leave request not found.", null, 404);
        }

        // Only allow updating leaves that are still pending
        if (leave.leaveStatus !== "PENDING") {
            return commonUtils.sendErrorResponse(req, res, `This leave has already been ${leave.leaveStatus} and cannot be changed.`, null, 400);
        }

        // Apply changes
        leave.leaveStatus = newStatus;

        // If rejected, store the admin's explanation
        if (newStatus === "REJECTED") {
            leave.rejectionReason = rejectionReason;
        }

        // Save safely
        await leave.save();

        return commonUtils.sendSuccessResponse(req, res, `Leave request has been successfully ${newStatus}.`, leave);

    } catch (error) {
        return commonUtils.sendErrorResponse(req, res, error.message, null, 500);
    }
};

module.exports = {
    getAllLeaves,
    updateLeaveStatus
};
