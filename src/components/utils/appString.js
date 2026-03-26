module.exports = {

  //=============== DATABASE====================

  DATABASE_CONNECT: "Database is connected",
  SERVER_RUNNING: "Server is running on",
  SERVER_ERROR: "Server error!",

  //===================TOKEN====================

  TOKEN_NOT_PROVIDED: "Token not provided!",
  REFRESH_TOKEN_MISSING: "Refresh token missing!",
  ACCESS_TOKEN_REFRESHED: "Access token refreshed",
  REFRESH_TOKEN_EXPIRE: "Refresh token expired, please login again!",
  INVALID_REFRESH_TOKEN: "Invalid refresh token!",
  INVALID_TOKEN_IN_REDISH: "Invalid or expired token in Redis!",
  INVALID_TOKEN: "Invalid or expired token!",

  // =================REDIS======================

  REDIS_CONNECT: "Connected to Redis",
  REDIS_CLIENT_ERROR: "'Redis Client Error !'",
  REDIS_FAILED: "Failed to connect to Redis !",


  //=================ADMIN side===================

  ADMIN_EXIST: "Admin already exists1",
  EMAIL_USE: "Email already in use!",
  REGISTRATION_ERROR: "Registration error!",
  REGISTRATION_FAILED: "Registration failed!",
  REGISTRATION_SUCCESS: "User registrartion successfull",
  LOGIN_SUCCESS: "Login successsfull",
  LOGIN_FAILED: "Login failed ",
  USER_NOT_FOUND: "User not Found",
  WRONG_PASSWORD: "Password is invalid!",
  //  Steps
  STEP_EXIST: "Thise step already exist",
  STEP_CREATED: "Step created successfully",
  STEP_NOT_CREATED: " Step not created ! failed",
  //leave
  LEAVE_FETCHED: "Leave requests retrieved successfully.",
  PROVIDE_STATUS: "Please provide the status",
  INVALID_STATUS: "Invalid status.",
  REJECTION_REASON:"A rejection reason must be provid9ed when rejecting a leave request",
  LEAVE_NOT_FOUND: "Leave request not found.",
  LEAVE_ALREADY:"This leave has already been ${leave.leaveStatus} and cannot be changed",
  LEAVE_APPROVED:"Doctor leave  has been granted access.",
  LEAVE_REJECTED: "Doctor leave has been rejected.",
 //doctor profile
  REJECTION_REASON_ACCOUNT:"A rejection reason must be provid9ed when rejecting Account",
  ACCOUNT_ACCESS:"Doctor account has been verified and granted access.",
  ACCOUNT_RTEJECTED:"Doctor account has been verified and granted access.",
  DOCTOR_NOT_FOUND: "Doctor not found.",
  PROFILE_DETAIL:"Doctor profile details.",

  

  //============ Doctor =========================//

  DOCTOR_EXIST: "Doctor already exist",
  DOCTOR_REGISTER: "Doctor register successfully",
  DOCTOR_REGISTET_FAILED: "Doctor register error",
  VERIFY_EMAIL_FIRST: "FIRST VERIFY YOUR EMAIL",
  DOCTOR_NOT_FOUND: "Doctor not Found",
  EMAIL_VERIFIED: "email is verified",
  EMAIL_OTP_REQUIRED: "email and OTP required",
  INVALID_OTP: "Otp invalid ",
  OTP_EXPIRED: " Your OTP is Expired ",
  
 //step
  STEP_NO_REQUIRED: "Step number is required",
  RULE_NOT_DEFIN:"Step rules not defined by admin NOW.",
  INVALID_STEP:"Invalid step rule in settings",
  STEP_UPDETED: "Step updated successfully and is pending admin approval",
 // leave
  FULL_DAY: "full_day",
  HALF_DAY: "half_day",
  CUSTOM:"custom_leave",

PROVIDE_DATE:"Please provide the dates you will be unavailable.",
CAN_NOT_BOOK:"Cannot apply full day, slots already exist",
LEAVE_SUCCESS:   "Leave request processed successfully.",

//APPPOINTMENTS
FETCH_SUCESS:"Appointments retrieved successfully.",
NOT_FOUND: "Appointment not found.",
INVALID_AP_STATUS: "Invalid status. Please use ACCEPTED for(1), REJECTED for(2), or CANCELLED(3).",




//============ Patient =========================//

  PATIENT_EXIST: "Patient already exists",
  PATIENT_REGISTER: "Patient registered successfully",
  PATIENT_REGISTER_FAILED: "Patient registration failed",
  PATIENT_NOT_FOUND: "Patient not found",
  // get doctor profile

 DOCTOR_GET:"Doctors retrieved successfully",
 DOCTOR_PROFILE_GET:"Doctor profile retrieved successfully",
 // Slot

DATE_REQUIRED:"Date is required (format: YYYY-MM-DD)",
INVALI_DATE:"Invalid date format. Use YYYY-MM-DD",
PAST_SLOT:"Cannot check slots for past dates",
NOT_AVAILBLE_SLOT:"Doctor has not set available time slots",
NOT_AVAILBLE_DAY:"Doctor is not available on this day",
ON_LEAVE:"Doctor is on leave on this date",
//appointmjent

PAST_APPOINTMENTS:"Cannot book appointments for past dates.",
DOCTOR_NOT: "Doctor not found or not verified.",
ALREADY_BOOK: "This time slot is already booked for the selected doctor. Please choose a different time.",
DOCTOR_ON_LEAVE_DAY:"Doctor is on leave on this date.",
DOCTOE_ON_LEAVE_TIMEsLOT: "Doctor is on leave during this time slot.",
APPOINTMENT_BOOK: "Appointment booked successfully.",
AVAILABLE_SLOTS_RETRIEVED: "Available slots retrieved successfully.",
MISSING_BOOKING_DETAILS: "doctorId, date, startTime, and endTime are required.",
APPOINTMENTS_RETRIEVED: "Appointments retrieved successfully.",
APPOINTMENT_NOT_FOUND: "Appointment not found.",
APPOINTMENT_DETAILS_RETRIEVED: "Appointment details retrieved.",
CANNOT_RESCHEDULE_BLOCKED: "Cannot reschedule completed, cancelled, or rejected appointments.",
CANNOT_RESCHEDULE_PAST: "Cannot reschedule an appointment that has already started or passed.",
CANNOT_RESCHEDULE_WITHIN_60: "Appointments starting within 60 minutes cannot be rescheduled.",
NEW_SLOT_BOOKED: "The new time slot is already booked. Please choose a different time.",
APPOINTMENT_RESCHEDULED: "Appointment rescheduled successfully.",
APPOINTMENT_CANCELLED: "Appointment cancelled successfully.",
CANNOT_CANCEL: "Cannot cancel an appointment that is already ",
CAN_NOT_UPDATE:"Cannot update an appointment that is already completed.",
CAN_NOT_RESCHEDULE:"Cannot reschedule completed, cancelled, or rejected appointments.",
CAN_NOT_RESCHEDULE_STARTED:  "Cannot reschedule an appointment that has already started or passed.", 
APPOINTMENT_STARTED: "Appointments starting within 60 minutes cannot be rescheduled.",
APPOINTMENT_SUCESS:"Appointment rescheduled successfully.",
//===========MODELS NAMES======================//

  //Admin side
  ADMIN: "Admin",
  SETTING: "Setting",
  STEP: "Step",

  //doctor Side
  DOCTOR: "Doctor",
  APPOINTMENT: "Appointment",

  //patients Side
  PATIENTS: "Patient",



  NOT_ACCESSIBLE: "Account is not verified. Please complete all required steps and wait for admin approval.", 
INTERNAL_ERROR:"Internal Server Error",
}