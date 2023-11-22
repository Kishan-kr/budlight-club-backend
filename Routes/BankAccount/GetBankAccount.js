const router = require('express').Router()
const authenticateToken = require('../../Middlwares/AuthenticateToken');
const BankAccount = require('../../Models/BankAccount');

router.get('/', authenticateToken, async (req, res) => {
  const user = req.user.id;
  let success = false;

  try {
    // find Bank account using user id 
    const bankAccounts = await BankAccount.find({user});

    if(!bankAccounts?.length) {
      console.error('No Bank account Found')
    }

    res.status(200).json({success: true, bankAccounts});

  } catch (error) {
    console.error('Error fetching Bank account: ', error)
    res.status(500).json({success, error: 'An error occurred while fetching Bank account.' });
  }
})

module.exports = router;