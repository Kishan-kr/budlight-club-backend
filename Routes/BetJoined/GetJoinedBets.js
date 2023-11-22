const authenticateToken = require('../../Middlwares/AuthenticateToken');
const BetJoined = require('../../Models/BetJoined');
const router = require('express').Router();

// Endpoint to Get images of a user with pagination
router.get('/', authenticateToken, async (req, res) => {
  const user = req.user.id;
  const itemsPerPage = req.query.items; // Number of bets to show per page
  const page = req.query.page || 1; // Get the requested page from the query parameters
  let success = false;

  try {
    // Calculate the number of bets to skip based on the requested page
    const skipCount = (page - 1) * itemsPerPage;

    // Find joined bets of a user in DB with pagination
    const joinedBets = await BetJoined.find({ user })
      .populate('bet')
      .sort({ joinedAt: -1 })
      .skip(skipCount)
      .limit(itemsPerPage)

    if (!joinedBets || joinedBets.length <= 0) {
      console.log('No joined bets found!')
    }

    success = true;
    res.status(200).json({ success, joinedBets });
  } catch (error) {
    console.error('Error fetching joined bets: ', error);
    res.status(500).json({ success, error: 'Error while fetching joined bets of a user' });
  }
});

module.exports = router;
