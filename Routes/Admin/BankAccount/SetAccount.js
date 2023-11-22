const router = require('express').Router()
const authenticateAdmin = require('../../../Middlwares/AuthenticateAdmin');
const PayoutBank = require('../../../Models/PayoutBank');

// Endpoint to get admin information 
router.put('/', authenticateAdmin, async (req, res) => {
  let success = false;
  const {number, mode, minimumThreshold} = req.body;

  try {
    // get admin's bank account, mode, and minimumThreshold required to process payout 
    const account = await PayoutBank.findOne();
    
    if(!account) {
      console.error('Payout bank account not found while updating');
      return res.status(404).json({success, error: 'Payout bank account not found while updating'})
    }

    // update admin's bank account, mode, and minimumThreshold required to process payout
    account.number = number;
    account.mode = mode;
    account.minimumThreshold = minimumThreshold;
    await account.save();

    success = true;
    res.status(200).json({ success, account });
  } catch (error) {
    console.error('Error setting admin bank account and mode: ', error);
    res.status(501).json({ success, error: "Error occurred while setting admin's bank account and mode" })
  }
})

module.exports = router;