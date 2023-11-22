const authenticateToken = require('../../Middlwares/AuthenticateToken');
const User = require('../../Models/User');
const bcrypt = require('bcrypt')

const router = require('express').Router()

router.delete('/', authenticateToken, async (req, res)=> {
  const userId = req.user.id;
  const {password} = req.body;
  let success = false;

  try {
    // find user with the provided phone 
    const user = await User.findById(userId)

    // Return if user does not exist with this phone 
    if(!user) {
      return res.status(401).json({success, error: 'User does not exist'})
    }

    // verify password for authentication 
    const hash = user.password
    const isCorrect = bcrypt.compareSync(password, hash);

    if(!isCorrect) {
      return res.status(401).json({success, error: 'Unauthorized access: Incorrect password'})
    }

    // Delete the user from DB 
    const deletedUser = await User.findByIdAndDelete(userId)

    if(!deletedUser) {
      console.error('Error deleting account: ', error);
      res.status(500).json({success, error: 'Error deleting account'}) 
    }

    success = true;
    res.status(200).json({success, deletedUser})
    
  } catch (error) {
    if(error) {
      console.error('Error deleting account: ', error);
      res.status(500).json({success, error: 'Error occurred while deleting account'})
    }
  }
})

module.exports = router;