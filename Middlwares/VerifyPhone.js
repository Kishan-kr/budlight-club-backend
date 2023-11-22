const twilio = require('twilio');
const User = require('../Models/User');
const Admin = require('../Models/Admin');
const twilioAccountSid = process.env.TWILIO_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(twilioAccountSid, twilioAuthToken);
const OTP_EXPIRY = 5 * 60; // OTP validity period in seconds

// Store OTP for a user
const otpStorage = new Map();

// function to generate  6-digit OTP
function generateOTP() {
  return Math.floor(Math.random() * 900000 + 100000);
}

// Middleware to send OTP to user's phone 
function sendOTP(req, res, next) {
  const phone = req.body.phone;
  const otp = generateOTP();
  const message = `Your budlight-club verification code is: ${otp}`

  twilioClient.messages.create({
    from: '(902) 200-6123',
    body: message,
    to: phone
  }).then(() => {
    // Store the OTP and its timestamp
    const otpData = {
      otp,
      timestamp: Date.now(),
      attempts: 0,
    };
    otpStorage.set(phone, otpData);
    next();
  })
  .catch((error) => {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Error sending OTP' });
  });
}

// Function to verify OTP 
function verifyOTP(phone, otp, maxAttempts) {
  const otpData = otpStorage.get(phone);

  if (!otpData) {
    return { success: false, message: 'Invalid OTP or OTP expired' };
  }

  if (otpData.attempts >= maxAttempts) {
    otpStorage.delete(phone);
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

  return { success: false, message: 'Invalid OTP' };
}

async function userMustExist(req, res, next) {
  const phone = req.body.phone;
  try {
    // check if user with same phone already exists
    const userExists = await User.findOne({ phone })

    if (!userExists) {
      return res.status(404).json({ success: false, error: 'User does not exist with this phone' })
    }
    next()
  } catch (error) {
    console.error('Error Finding user:', error);
    res.status(500).json({ error: 'Error finding user' });
  }
}

async function userMustNotExist(req, res, next) {
  const phone = req.body.phone;
  try {
    // check if user with same phone already exists
    const userExists = await User.findOne({ phone })

    if (userExists) {
      return res.status(404).json({ success: false, error: 'User already exists with this phone' })
    }
    next()
  } catch (error) {
    console.error('Error Finding user:', error);
    res.status(500).json({ error: 'Error finding user' });
  }
}

async function adminMustExist(req, res, next) {
  const phone = req.body.phone;
  try {
    // check if user with same phone already exists
    const userExists = await Admin.findOne({ phone })

    if (!userExists) {
      return res.status(404).json({ success: false, error: 'Admin user does not exist with this phone' })
    }
    next()
  } catch (error) {
    console.error('Error Finding admin user:', error);
    res.status(500).json({ error: 'Error finding admin user' });
  }
}

module.exports = {sendOTP, verifyOTP, userMustExist, userMustNotExist, adminMustExist};