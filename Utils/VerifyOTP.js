function verifyOTP(phone, otp, maxAttempts) {
  const otpData = otpStorage.get(phone);

  if (!otpData) {
    return { success: false, message: 'Invalid OTP or OTP expired' };
  }

  if (otpData.attempts >= maxAttempts) {
    return { success: false, message: 'Maximum verification attempts exceeded' };
  }

  if (otpData && otpData.otp === otp) {
    const otpTimestamp = otpData.timestamp;
    const currentTimestamp = Date.now();

    if (currentTimestamp - otpTimestamp <= OTP_EXPIRY * 1000) {
      otpStorage.delete(phone);
      return { success: true, message: 'OTP verified' };
    }
  }

  // Increment the attempts count
  otpData.attempts = (otpData.attempts || 0) + 1;
  otpStorage.set(phone, otpData);

  return { success: false, message: 'Invalid OTP or OTP expired' };
}

module.exports = verifyOTP;
