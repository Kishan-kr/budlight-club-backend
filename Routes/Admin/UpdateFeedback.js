const authenticateAdmin = require('../../Middlwares/AuthenticateAdmin');
const Feedback = require('../../Models/Feedback');
const router = require('express').Router();

// Endpoint to update status of a feedback
router.put('/feedback/:id', authenticateAdmin, async (req, res) => {
  let success = false;
  const id = req.params.id;
  const { status } = req.body;

  try {

    // Find all feedbacks of a user in DB with pagination
    const feedback = await Feedback.findByIdAndUpdate(id, {status}, {new: true});

    if(!feedback) {
      console.error("Unable to update feedback");
      return res.status(400).json({success, error: 'Unable to update feedback'})
    }

    success = true;
    res.status(200).json({ success, feedback });
  } catch (error) {
    console.error('Error updating feedback: ', error);
    res.status(500).json({ success, error: 'Error while updating feedback of a user' });
  }
});

module.exports = router;
