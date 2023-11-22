const shortUUID = require('short-uuid');
const authenticateToken = require('../../Middlwares/AuthenticateToken');
const router = require('express').Router();
const Wallet = require('../../Models/Wallet');
const fetch = require('node-fetch');
const {
  createPendingTransaction,
  updateWalletAndTransaction,
  handleFailedPayoutRequest
} = require('../../Utils/PayoutUtils');
const PayoutBank = require('../../Models/PayoutBank');

// razorpay payout URL 
const payoutURL = 'https://api.razorpay.com/v1/payouts';

router.post('/payout/:fundId', authenticateToken, async (req, res) => {
  const user = req.user.id;
  const fund_account_id = req.params.fundId;
  let success = false;

  try {
  // get admin's bank account number and mode to process payout 
  const account = await PayoutBank.findOne();;
  const minimumThreshold = account.minimumThreshold;

  const { amount, currency } = req.body;
  
  // calculate net amount by deducting 5% fee 
  const netAmount = amount - (amount * 0.05);

  // Access the io instance from app context
  const io = req.app.get('io')

  // payout body to be sent during razorpay post request 
  const payoutBody = {
    account_number: account.number,
    fund_account_id,
    amount: netAmount * 100,
    currency,
    mode: account.mode,
    purpose: 'payout',
    queue_if_low_balance: true,
    reference_id: shortUUID.generate(),
    narration: 'Budlight-club customer payout',
    notes: {
      user,
    }
  };

    // Fetch user's wallet info 
    const userWallet = await Wallet.findOne({ user });

    if (!userWallet) {
      console.error('Unable to fetch user wallet');
      return res.status(400).json({ success, error: 'Error doing payout' });
    }

    // Cannot widthdraw less than minimum threshold
    if (amount < minimumThreshold) {
      console.error('Withdrawal amount is less than minimum threshold');
      return res
        .status(400)
        .json({ success, error: `Withdrawal amount must not be less than ${minimumThreshold}` });
    }

    // check if user's wallet balance is sufficient 
    if (userWallet.balance < amount) {
      console.error("Insufficient balance in user's wallet");
      return res.status(400).json({ success, error: 'Insufficient balance in your wallet' });
    }

    // create initial pending transaction 
    const transaction = await createPendingTransaction(user, amount, userWallet, fund_account_id);

    // post request to razorpay payout 
    const payoutResponse = await fetch(payoutURL, {
      method: 'post',
      body: JSON.stringify(payoutBody),
      headers: { 'Content-Type': 'application/json' },
    });

    if (payoutResponse.status !== 200) {
      await handleFailedPayoutRequest(transaction, userWallet.balance);
      console.error('Unable to process payout');
      return res.status(400).json({ success, error: 'Payout failed' });
    }

    const payoutData = await payoutResponse.json();

    // update user's wallet balance and transaction history 
    await updateWalletAndTransaction(transaction, userWallet, payoutData);

    // Emit the event to the admin panel
    io.emit('widthdrawalRequest', transaction);

    success = true;
    res.status(200).json({ success, transaction });
  } catch (error) {
    console.error('Error initiating payout: ', error);
    res.status(500).json({ success, error: 'Error occurred while withdrawing' });
  }
});

module.exports = router;
