const { body, validationResult } = require('express-validator');
const User = require('../../Models/User');
const { sendOTP, verifyOTP, userMustExist } = require('../../Middlwares/VerifyPhone');
const bcrypt = require('bcrypt')
const router = require('express').Router()

// route to send OTP to the user's mobile phone 
router.put('/reset-password/send-otp', [
  body('phone', 'Phone number is not valid').isMobilePhone('en-IN')
], userMustExist, sendOTP, (req, res) => {
  // extract errors from request 
  const errors = validationResult(req);

  // send errors as response if available 
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(400).json({success, error:errors.array()});
  }
  res.status(200).json({success: true, message: 'OTP sent successfully'})
});

// route to verify phone number 
router.put('/reset-password/verify-phone', async (req, res) => {
  const { phone, otp } = req.body;
  
  // Verify OTP
  const verificationResult = verifyOTP(phone, Number(otp), 3); // Max 3 attempts
  const {success, message} = verificationResult;
  if (!success) {
    return res.status(400).json({success, error: message });
  }

  // Store verified phone number temporarily
  res.status(200).json({ success: true, phone });
});


router.put('/reset-password/new', [
  body('phone', 'phone number is not valid').isMobilePhone('en-IN'),
  body('password').isLength({ min: 8 }).withMessage('Minimum length of password must be 8')
    .not().isNumeric().withMessage('Password must contain an alphabet')
    .not().isAlpha().withMessage('Password must contain a number')
    .not().isUppercase().withMessage('Password must contain a lowercase letter')
    .not().isLowercase().withMessage('Password must contain a uppercase letter')
], async (req, res) => {
  const { phone, password } = req.body;
  let success = false;

  // check for validation errors 
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(400).json({ success, error: errors.array() });
  }

  try {
    const user = await User.findOne({phone});

    const userId = user.id;

    // generate salt for the password 
    const salt = await bcrypt.genSalt(10);

    // create hash for the password 
    const hash = await bcrypt.hash(password, salt)

    // update user's password 
    const updatedUser = await User.findByIdAndUpdate(userId, {password: hash}, {new: true});

    if(!updatedUser) {
      console.error('Error resetting password')
      return res.status(500).json({success, error: 'Error resetting password'})
    }

    success = true;
    res.status(200).json({success, message: 'Password reset successfully'})

  } catch (error) {
    if(error) {
      console.error('Error resetting password: ', error)
      res.status(500).json({success, error: 'Error occurred while resetting password'})
    }
  }
})

module.exports = router;