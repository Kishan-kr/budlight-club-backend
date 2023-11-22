const authenticateAdmin = require('../../Middlwares/AuthenticateAdmin');
const Feedback = require('../../Models/Feedback');
const router = require('express').Router();

// Endpoint to Get feedbacks of a user with pagination
router.get('/feedback/:id', authenticateAdmin, async (req, res) => {
  const id = req.params.id;
  let success = false;

  try {
    // Find the feedback using id 
    const feedback = await Feedback.findById(id)
      .populate('user')
    
    if(!feedback) {
      console.error('Feedback having the provided id not found')
      return res.status(404).json({success, error: 'Feedback not found'})
    }

    success = true;
    res.status(200).json({ success, feedback });
  } catch (error) {
    console.error('Error fetching feedback: ', error);
    res.status(500).json({ success, error: 'Error while fetching a feedback' });
  }
});

module.exports = router;
