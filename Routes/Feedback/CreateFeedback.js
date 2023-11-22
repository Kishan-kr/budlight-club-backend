
const { body, validationResult } = require('express-validator')
const router = require('express').Router()
const Feedback = require('../../Models/Feedback');
const authenticateToken = require('../../Middlwares/AuthenticateToken');

// route to complete registration and create a user 
router.post('/', [
  body('description', 'Description must not be empty').exists(),
], authenticateToken, async (req, res) => {
  let success = false;

  // extract userId from request 
  const user = req.user.id;

  // destructure properties from request body 
  const { category, type, description, transaction } = req.body;

  // extract errors from request 
  const errors = validationResult(req);

  // send errors as response if available 
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(400).json({success, error:errors.array()});
  }

  try {

    // create user object from request body and send success response
    const feedback = new Feedback({
      user,
      transaction,
      category,
      type,
      description,
      status: 'open',
    })

    await feedback.save();

    if(!feedback) {
      console.error('Unable to create a feedback document')
      return res.status(400).json({success, error: 'Unable to send your feedback'})
    }

    success = true;
    res.status(200).json({ success, feedback });
    
  } catch (error) {
    console.error('Error creating feedback: ', error)
    res.status(500).json({success, error: 'Error occurred while sending feedback'})
  }
})

module.exports = router;
 