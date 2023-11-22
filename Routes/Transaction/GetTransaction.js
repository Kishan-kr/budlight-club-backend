const router = require('express').Router()
const Transaction = require('../../Models/Transaction');
const authenticateToken = require('../../Middlwares/AuthenticateToken');
const User = require('../../Models/User');
const BankAccount = require('../../Models/BankAccount');

router.get('/', authenticateToken, async (req, res) => {
  const user = req.user.id;
  let success = false;

  const itemsPerPage = req.query.items; // Number of bets to show per page
  const page = req.query.page || 1; // Get the requested page from the query parameters

  // Calculate the number of bets to skip based on the requested page
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

  if (req.query.commissionLevel) {
    query.commissionLevel = req.query.commissionLevel;
  }

  if (req.query.status) {
    // Convert the 'status' query parameter to an array of values
    const statusValues = req.query.status.split(',');

    // Use the $in operator to match any of the specified status values
    query.status = { $in: statusValues };
  }

  try {
    // find transactions based on the query 
    const transactions = await Transaction.find(query).populate({
      path: 'commissionSource', // Populate the commissionSource field
      populate: {
        path: 'user', // Populate the user field within commissionSource
        model: User, // Specify the model for user
      },
    })
    .populate({
      path: 'bank', // Populate the bank field within the first transaction
      model: BankAccount, // Specify the model for the bank
    }).sort({ createdAt: -1 })
    .skip(skipCount)
    .limit(itemsPerPage);
    res.status(200).json({success: true, transactions});

  } catch (error) {
    console.error('Error fetching transactions: ', error)
    res.status(500).json({success, error: 'An error occurred while fetching transactions.' });
  }
})

module.exports = router;