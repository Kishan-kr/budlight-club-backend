const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt')
const User = require('../../Models/User');
const {generateJWT} = require('../../Utils/GenerateJWT');

const router = require('express').Router();

// route to login user 
router.post('/login', [
  body('phone', 'Phone number is not valid').isMobilePhone('en-IN'),
  body('password', 'Password must not be empty').exists()
], async (req, res) => {
  // destructure credentials from request body 
  const {phone, password} = req.body;
  let success = false;

  // return if validation error exists 
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({success, error: errors.array()})
  }

  try {
    // find user with the provided phone 
    const user = await User.findOne({phone})

    // Return if user does not exist with this phone 
    if(!user) {
      return res.status(401).json({success, error: 'User with this phone does not exist'})
    }

    // verify password for authentication 
    const hash = user.password
    const isCorrect = bcrypt.compareSync(password, hash);

    if(!isCorrect) {
      return res.status(401).json({success, error: "Unauthorized access: Incorrect Password"})
    }

    // generate jwt token 
    const payload = {
      id: user.id,
      name: user.name
    }
    const token = generateJWT(payload)

    success = true;
    res.status(200).json({success, token});
    
  } catch (error) {
    if(error) {
      console.error('Error logging in: ', error);
      res.status(500).json({success, error: 'Error occurred while logging in'})
    }
  }
})

module.exports = router;