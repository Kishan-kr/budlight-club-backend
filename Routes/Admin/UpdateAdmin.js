const router = require('express').Router()
const { body } = require('express-validator')
const Admin = require('../../Models/Admin');
const authenticateAdmin = require('../../Middlwares/AuthenticateAdmin');

router.put('/', authenticateAdmin, [
  body('name', 'Name must contain alphabets only').optional().isAlpha()
    .isLength({min: 3}).withMessage('Name must contain minimum three letters'),
  body('email', 'Email is not valid').optional().isEmail()
], async (req, res) => {
  const userId = req.user.id;
  let updateFields = {}
  let success = false;

  // Add 'name' field in updateFields object if name is in request body 
  if(req.body.name) {updateFields.name = req.body.name}
  // Add 'email' field in updateFields object if email is in request body 
  if(req.body.email) {updateFields.email = req.body.email}
  // Add 'phone' field in updateFields object if phone is in request body 
  if(req.body.phone) {updateFields.email = req.body.phone}

  try {
    // Find user information from DB and update
    const updatedAdmin = await Admin.findByIdAndUpdate(userId, updateFields, { new: true })


    if (!updatedAdmin) {
      return res.status(404).json({ success, error: 'User not found' });
    }

    success = true;
    return res.status(200).json({success, updatedAdmin});

  } catch (err) {
    console.error('Error updating user:', err);
    return res.status(500).json({success, error: 'An error occurred while updating user' });
  }
})

module.exports = router;