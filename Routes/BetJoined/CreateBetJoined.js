const { body, validationResult } = require('express-validator');
const authenticateToken = require('../../Middlwares/AuthenticateToken')
const Transaction = require('../../Models/Transaction')
const Wallet = require('../../Models/Wallet');
const BetJoined = require('../../Models/BetJoined');
const Bet = require('../../Models/Bet');
const router = require('express').Router()

const minThreshold = 10;

// Custom validation function for amount field
const isMinThreshold = amount => {
  return amount >= minThreshold;
};

router.post('/:id', authenticateToken, [
  body('betAmount', 'Amount must be a number only').isNumeric()
    .custom(amount => isMinThreshold(amount)).withMessage(`amount must not be less than ${minThreshold}`)
], async (req, res) => {
  const user = req.user.id;
  const betId = req.params.id;
  let success = false;
  const { betAmount, selectionType, selectedColor, selectedNumber } = req.body;

  // Access the io instance from app context
  const io = req.app.get('io')

  // validation errors 
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('validation errors:', errors.array())
    return res.status(400).json({ success, error: errors.array() })
  }

  try {
    // check if the result of the bet is already declared 
    const bet = await Bet.findOne({ betId });
    if (bet && bet.result === 'finished') {
      console.error('Result of the bet has been declared already');
      return res.status(400).json({ success, error: 'This period has been closed' })
    }

    const wallet = await Wallet.findOne({ user });
    if (!wallet) {
      console.error('Unable to use wallet')
      return res.status(400).json({ success, error: 'User wallet not found' })
    }

    // check user's wallet has sufficient balance to join 
    if (wallet.balance < betAmount) {
      console.error("Insufficient balance in user's wallet")
      return res.status(400).json({ success, error: 'Insufficient balance in your wallet' })
    }

    // check if already joined this bet 
    const isJoined = await BetJoined.findOne({ bet: bet._id, user });
    if (isJoined) {
      console.error('User has already joined this bet')
      return res.status(400).json({ success, error: 'You have already joined this period' })
    }

    // create betjoined document 
    const fee = 0.05 * betAmount;
    const netAmount = betAmount - fee;

    const betJoined = await BetJoined.create({
      user,
      bet: bet._id,
      betAmount,
      selectionType,
      selectedColor,
      selectedNumber,
      fee,
      netAmount
    })

    if (!betJoined) {
      console.error('Unable to Create bet joined document')
      return res.status(400).json({ success, error: 'Error joining period' })
    }

    // calculate balance 
    const newBalance = wallet.balance - betAmount;

    const transaction = await Transaction.create({
      user,
      amount: betAmount,
      balance: newBalance,
      type: 'debit',
      category: 'betting',
      status: 'success',
    })

    if (!transaction) {
      console.error('Unable to create transaction document')
      return res.status(400).json({ success, error: 'Error joining period' })
    }

    // update wallet 
    wallet.balance = newBalance;
    await wallet.save()


    // update the current bet's user count and totalAmount 
    bet.userCount += 1;
    bet.totalAmount += betAmount;
    bet.save();

    // Emit the event to the admin panel passing joined details and updated bet
    io.emit('userJoinedBet', { betJoined, bet });

    success = true;
    res.status(200).json({ success, transaction })

  } catch (error) {
    console.error('Error joining bet: ', error);
    res.status(501).json({ success, error: "Error occurred while joining period" })
  }
})

module.exports = router;

