const authenticateAdmin = require('../../Middlwares/AuthenticateAdmin');
const BetJoined = require('../../Models/BetJoined');

const router = require('express').Router()

router.get('/view-joined-users/:betId', authenticateAdmin, async (req, res) => {
  const betId = req.params.betId;
  let success = false;

  const itemsPerPage = req.query.items; // Number of bets to show per page
  const page = req.query.page || 1; // Get the requested page from the query parameters

  // Calculate the number of bets to skip based on the requested page
  const skipCount = (page - 1) * itemsPerPage;

  try {
    const users = await BetJoined.find({bet: betId});

    if(!users || users.length <= 0) {
      console.log('No joined user found')
      success = true;
      return res.status(200).json({success, users})
    }

    success = true;
    res.status(200).json({success, users});
  } catch (error) {
    console.error('Error while fetching joined users of a bet: ', error)
    res.status(500).json({success, error: 'Error while fetching joined users of a bet'})
  }
})

module.exports = router;