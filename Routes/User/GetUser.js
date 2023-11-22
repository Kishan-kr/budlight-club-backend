const router = require('express').Router()
const authenticateToken = require('../../Middlwares/AuthenticateToken');
const User = require('../../Models/User')

// Endpoint to get user information 
router.get('/', authenticateToken, (req, res)=> {
  const id = req.user.id;
  let success = false;

  try {
    // find user in database 
    User.findById(id).select('-password').then((user) => {
      if(!user) {
        return res.status(404).json({success, error: 'User not found'})
      }  

      success = true;
      res.status(200).json({success, user});
    })
  } catch(error) {
    console.error('Error Fetching user: ', error);
    res.status(501).json({success, error: "Error occurred while Fetching user info"})
  }
})

module.exports = router;