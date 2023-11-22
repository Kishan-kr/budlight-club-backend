const Bet = require('../../Models/Bet');
const router = require('express').Router();

// Endpoint to Get images of a user with pagination
router.get('/running', async (req, res) => {
  let success = false;

  try {
    // retrieve latest bet
    const latestBet = await Bet.findOne().sort({ createdAt: -1 });
    
    if (!latestBet) {
      console.log("There's no bet available")
      return res.status(400).json({ success, error:"No running bet found" });
    }

    if(latestBet.status !== 'running') {
      console.log("No running bet found");
      return res.status(400).json({ success, error:"No running bet found" });
    }
    
    // get timer value from app context 
    const timer = req.app.get('timer');

    success = true;
    res.status(200).json({ success, bet:latestBet, timer });
  } catch (error) {
    console.error('Error fetching running bet: ', error);
    res.status(500).json({ success, error: 'Error while fetching running bet' });
  }
});

module.exports = router;
