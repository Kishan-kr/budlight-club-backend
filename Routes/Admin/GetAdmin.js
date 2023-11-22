const router = require('express').Router()
const authenticateAdmin = require('../../Middlwares/AuthenticateAdmin');
const Admin = require('../../Models/Admin')

// Endpoint to get admin information 
router.get('/', authenticateAdmin, (req, res)=> {
  const id = req.user.id;
  let success = false;

  try {
    // find user in database 
    Admin.findById(id).select('-password').then((user) => {
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