
const Admin = require('../../Models/Admin')
const { body, validationResult } = require('express-validator')
const router = require('express').Router()
const bcrypt = require('bcrypt')
const {generateAdminJWT} = require('../../Utils/GenerateJWT');
const {sendOTP, verifyOTP} = require('../../Middlwares/VerifyPhone');

// Custom validation function for name field
const isAlphaAndSpace = value => {
  return /^[A-Za-z ]+$/.test(value);
};


// route to send OTP to the user's mobile phone 
router.post('/initiate-register', sendOTP, (req, res) => {
  res.status(200).json({success: true, message: 'OTP sent successfully'})
});

// route to verify phone number 
router.post('/verify', async (req, res) => {
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


// route to complete registration and create a user 
router.post('/complete-registration', [
  body('name').custom(value => isAlphaAndSpace(value)).withMessage('Name must contain alphabets only')
    .isLength({ min: 3 }).withMessage('Name must contain minimum three letters'),
  body('phone', 'Phone number is not valid').isMobilePhone('en-IN'),
  body('password').isLength({ min: 8 }).withMessage('Minimum length of password must be 8')
    .not().isNumeric().withMessage('Password must contain an alphabet')
    .not().isAlpha().withMessage('Password must contain a number')
    .not().isUppercase().withMessage('Password must contain a lowercase letter')
    .not().isLowercase().withMessage('Password must contain a uppercase letter')
], async (req, res) => {
  let success = false;

  // destructure properties from request body 
  const { name, phone, password, email } = req.body;

  // extract errors from request 
  const errors = validationResult(req);

  // send errors as response if available 
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(400).json({success, error:errors.array()});
  }

  try {
    // check if user with same email already exists
    const adminExists = await Admin.findOne({ phone })

    if (adminExists) {
      return res.status(409).json({ success, error: 'An admin already exists with this phone' })
    }

    // generate salt for the password 
    const salt = await bcrypt.genSalt(10);

    // create hash for the password 
    const hash = await bcrypt.hash(password, salt)

    // create user object from request body and send success response
    let admin = {
      name,
      phone,
      email,
      password: hash,
    }

    Admin.create(admin).then((user) => {
      // generate jwt token 
      const payload = {
        id: user.id,
        name
      }
      const token = generateAdminJWT(payload)

      success = true;
      res.status(200).json({ success, message: 'Successfully created account', token });
    })
  } catch (error) {
      console.error('Error creating admin account: ', error)
      res.status(500).json({success, error: 'Error occurred while creating admin account'})
  }
})

module.exports = router;
 