const router = require('express').Router()
const { body } = require('express-validator')
const AuthenticateToken = require('../../Middlwares/AuthenticateToken');
const User = require('../../Models/User');

router.put('/', AuthenticateToken, [
  body('name', 'Name must contain alphabets only').isAlpha()
    .isLength({min: 3}).withMessage('Name must contain minimum three letters'),
  body('email', 'Email is not valid').isEmail()
], async (req, res) => {
  const userId = req.user.id;
  let updateFields = {}
  let success = false;

  // Add 'name' field in updateFields object if name is in request body 
  if(req.body.name) {updateFields.name = req.body.name}
  // Add 'email' field in updateFields object if email is in request body 
  if(req.body.email) {updateFields.email = req.body.email}

  try {
    // Find user information from DB and update
    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, { new: true })


    if (!updatedUser) {
      return res.status(404).json({ success, error: 'User not found' });
    }

    success = true;
    return res.status(200).json({success, user: updatedUser});

  } catch (err) {
    console.error('Error updating user:', err);
    return res.status(500).json({success, error: 'An error occurred while updating user' });
  }
})

module.exports = router;