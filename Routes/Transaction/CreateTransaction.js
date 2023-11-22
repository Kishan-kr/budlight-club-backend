const Transaction = require('../../Models/Transaction');
const router = require('express').Router()
const authenticateToken = require('../../Middlwares/AuthenticateToken');
const Wallet = require('../../Models/Wallet');

router.post('/', authenticateToken, async (req, res) => {
  let success = false;

  // extract userId from request 
  const userId = req.user.id;

  // destructure transaction fields form request body 
  const { type, category, amount } = req.body;

  try {
    // Retrieve wallet information of the user 
    const wallet = await Wallet.findOne({user: userId});
      
    if(!wallet) {
      return res.status(400).json({success, error: 'Unable to find wallet'})
    }

    // Calculate new balance in wallet 
    const newBalance = wallet.balance + amount;

    // Update wallet balance in DB 
    wallet.balance = newBalance
    wallet.save();

    // create transaction object 
    let transactionObject = {
      user: userId,
      balance: newBalance,
      type,
      category,
      amount,
      status: 'captured'
    }

    // create a transaction document 
    const transaction = new Transaction(transactionObject);
    await transaction.save();

    if(!transaction) {
      return res.status(500).json({success, error: 'Error creating transaction document'})
    }

    success = true;
    res.status(200).json({success, transaction});
    
  } catch (error) {
    console.error('Error doing transaction: ', error);
    res.status(500).json({success, error: 'Error while doing transaction'})
  }
})

module.exports = router;