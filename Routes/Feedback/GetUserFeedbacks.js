const authenticateToken = require('../../Middlwares/AuthenticateToken');
const Feedback = require('../../Models/Feedback');
const router = require('express').Router();

// Endpoint to Get feedbacks of a user with pagination
router.get('/', authenticateToken, async (req, res) => {
  const user = req.user.id;
  const itemsPerPage = req.query.items; // Number of feedbacks to show per page
  const page = req.query.page || 1; // Get the requested page from the query parameters
  let success = false;

  try {
    // Calculate the number of feedbacks to skip based on the requested page
    const skipCount = (page - 1) * itemsPerPage;

    // create query object and add user field 
    const query = { user };

    // add other query parameter if available in the request 
    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.type) {
      query.type = req.query.type;
    }

    // Find all feedbacks of a user in DB with pagination
    const feedbacks = await Feedback.find(query)
      .sort({ createAt: -1 })
      .skip(skipCount)
      .limit(itemsPerPage)

    success = true;
    res.status(200).json({ success, feedbacks });
  } catch (error) {
    console.error('Error fetching feedbacks: ', error);
    res.status(500).json({ success, error: 'Error while fetching feedbacks of a user' });
  }
});

module.exports = router;
