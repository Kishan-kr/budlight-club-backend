const router = require('express').Router()
const bcrypt = require('bcrypt')
const { body, validationResult } = require('express-validator')
const authenticateAdmin = require('../../Middlwares/AuthenticateAdmin');
const Admin = require('../../Models/Admin');

router.put('/change-password', authenticateAdmin, [
  body('currentPassword', 'Current password must exist').exists(),
  body('newPassword').isLength({ min: 8 }).withMessage('Minimum length of password must be 8')
    .not().isNumeric().withMessage('Password must contain an alphabet')
    .not().isAlpha().withMessage('Password must contain a number')
    .not().isUppercase().withMessage('Password must contain a lowercase letter')
    .not().isLowercase().withMessage('Password must contain a uppercase letter')
], async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;
  let success = false;

  // check for validation errors 
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(400).json({ success, error: errors.array() });
  }

  try {
    const user = await Admin.findById(userId);
    // Return if user does not exist  
    if (!user) {
      return res.status(401).json({ success, error: 'Admin user does not exist' })
    }

    // verify password for authentication 
    const previousHash = user.password
    const isCorrect = bcrypt.compareSync(currentPassword, previousHash);

    if (!isCorrect) {
      return res.status(401).json({ success, error: "Unauthorized access: Incorrect Password" })
    }

    // generate salt for the password 
    const salt = await bcrypt.genSalt(10);

    // create hash for the password 
    const hash = await bcrypt.hash(newPassword, salt)

    // update user's password 
    const updatedAdmin = await Admin.findByIdAndUpdate(userId, {password: hash}, {new: true});

    if(!updatedAdmin) {
      console.error('Error updating password')
      return res.status(500).json({success, error: 'Error updating password'})
    }

    success = true;
    res.status(200).json({success, updatedAdmin})

  } catch (error) {
    if(error) {
      console.error('Error updating password: ', error)
      res.status(500).json({success, error: 'Error occurred while updating password'})
    }
  }
})

module.exports = router;