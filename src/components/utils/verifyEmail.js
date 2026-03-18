const Otp = require("../admin/model/otpModel")

const Otp_expiry = 10 * 60 * 1000; // 10 min

const generateOtp = (length = 6) => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(min + Math.random() * (max - min)).toString();
};

const verifyOtp = async (req, res) => {
  try {





    
    const { email, otp } = req.body;
    const normalizedEmail = email.toLowerCase();
    

    const otpData = await Otp.findOne({ email: normalizedEmail, otp });

    if (!otpData) {
      return commonUtils.sendErrorResponse(req, res, appString.INVALID_OTP, null, 400);
    }

    if (otpData.expiry < Date.now()) {
      return commonUtils.sendErrorResponse(req, res, appString.OTP_EXPIRED, null, 400);
    }

    otpData.isVerified = true;
    await otpData.save();
    return commonUtils.sendSuccessResponse(req, res, appString.OTP_VERIFIED);
  } catch (err) {
    return commonUtils.sendErrorResponse(req, res, err.message, null, 500);
  }
};