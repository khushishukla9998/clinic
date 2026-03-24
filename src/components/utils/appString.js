module.exports = {

  // DATABASE
  DATABASE_CONNECT: "Database is connected",
  SERVER_RUNNING: "Server is running on",
  SERVER_ERROR: "Server error!",

  // TOKEN
  TOKEN_NOT_PROVIDED: "Token not provided!",
  REFRESH_TOKEN_MISSING: "Refresh token missing!",
  ACCESS_TOKEN_REFRESHED: "Access token refreshed",
  REFRESH_TOKEN_EXPIRE: "Refresh token expired, please login again!",
  INVALID_REFRESH_TOKEN: "Invalid refresh token!",
  INVALID_TOKEN_IN_REDISH: "Invalid or expired token in Redis!",
  INVALID_TOKEN: "Invalid or expired token!",

  // REDIS
  REDIS_CONNECT: "Connected to Redis",
  REDIS_CLIENT_ERROR: "'Redis Client Error !'",
  REDIS_FAILED: "Failed to connect to Redis !",

  //ADMIN side===================

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

  REJECTION_REASON_ACCOUNT:"A rejection reason must be provid9ed when rejecting Account",


  //USER=============

  MAIL_SEND: "Verification email sent. Please check your inbox.",
  STREAX_REWARD: " You've reached a 5-day streak! Extra 50 points awarded.",
  INVALID_VERIFY_TOKEN: "Invalid or expired verification token.",
  VERIFICATION_FAILED: "Verification failed.",

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

  //============ Patient =========================//

  PATIENT_EXIST: "Patient already exists",
  PATIENT_REGISTER: "Patient registered successfully",
  PATIENT_REGISTER_FAILED: "Patient registration failed",
  PATIENT_NOT_FOUND: "Patient not found",

  //===========MODELS NAMES=================

  // ========= Admin side
  ADMIN: "Admin",
  SETTING: "Setting",
  STEP: "Step",

  // ============= doctor Side
  DOCTOR: "Doctor",
  APPOINTMENT: "Appointment",
  // ============= patients Side
  PATIENTS: "Patient"

}