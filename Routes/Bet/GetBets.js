const Bet = require('../../Models/Bet');
const router = require('express').Router();

// Endpoint to Get images of a user with pagination
router.get('/', async (req, res) => {
  const itemsPerPage = req.query.items || 480; // Number of bets to show per page
  const page = req.query.page || 1; // Get the requested page from the query parameters
  let success = false;

  try {
    // Calculate the number of bets to skip based on the requested page
    const skipCount = (page - 1) * itemsPerPage;

    const today = new Date();
    // Set the time to the beginning of the day
    today.setHours(0, 0, 0, 0); 

    const tomorrow = new Date(today);
    // Set the time to the beginning of the next day
    tomorrow.setDate(today.getDate() + 1);

    // retrieve latest finished bets of the same day
    const bets = await Bet.find({
      status: 'finished', 
      createdAt: {
        $gte: today,
        $lt: tomorrow
      }}).sort({ createdAt: -1 }).skip(skipCount).limit(itemsPerPage);

    if (!bets || !bets.length) {
      console.log("There's no bet available")
    }

    success = true;
    res.status(200).json({ success, bets });
  } catch (error) {
    console.error('Error fetching previous bets: ', error);
    res.status(500).json({ success, error: 'Error while fetching previous bets' });
  }
});

module.exports = router;
