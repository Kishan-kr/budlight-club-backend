const router = require('express').Router()
const authenticateAdmin = require('../../../Middlwares/AuthenticateAdmin');
const PayoutBank = require('../../../Models/PayoutBank');

// Endpoint to get admin information 
router.get('/', authenticateAdmin, async (req, res) => {
  let success = false;

  try {
    // get admin's bank account and mode required to process payout 
    const account = await PayoutBank.findOne();

    if(!account) {
      console.error('Payout bank account not found');
      return res.status(404).json({success, error: 'Payout bank account not found'})
    }

    success = true;
    res.status(200).json({ success, account });
  } catch (error) {
    console.error('Error Fetching admin bank account and mode: ', error);
    res.status(501).json({ success, error: "Error occurred while Fetching admin's bank account and mode" })
  }
})

module.exports = router;