const Transaction = require("../Models/Transaction");
const Wallet = require("../Models/Wallet");
const BankAccount = require("../Models/BankAccount");

async function createPendingTransaction(userId, amount, userWallet, fundAccountId) {
  // find bank account details 
  const bank = BankAccount.findOne({fundAccountId}).select('id bankName accountNumber');

  const newBalance = userWallet.balance - amount;
  return Transaction.create({
    user: userId,
    type: 'debit',
    category: 'withdrawal',
    amount,
    status: 'pending',
    balance: newBalance,
    bank: bank.id
  });
}

async function handleFailedPayoutRequest(transaction, initialBalance) {
  transaction.status = 'failed';
  transaction.balance = initialBalance;
  await transaction.save();
}

async function handleFailedPayout(payout_id, amount) {
  const transaction = await Transaction.findOne({razorpay_payout_id: payout_id})

  // retrieve wallet 
  const userWallet = await Wallet.findOne({user: transaction.user})
  
  // calculate balance 
  const newBalance = userWallet.balance + amount;

  // update wallet balance and save 
  if(transaction.status === 'pending') {
    userWallet.balance = newBalance;
    await userWallet.save()

    // update transaction and save 
    transaction.balance = newBalance;
    transaction.status = 'failed';
    await transaction.save();
  }
}

async function handleProcessedPayout(payout_id, status) {
  const transaction = await Transaction.findOne({razorpay_payout_id: payout_id});
  transaction.status = status;
  await transaction.save()
}

async function updateWalletAndTransaction(transaction, userWallet, payoutData) {
  const newBalance = userWallet.balance - transaction.amount;
  userWallet.balance = newBalance;
  await userWallet.save();

  transaction.status = 'pending';
  transaction.razorpay_payout_id = payoutData.id
  await transaction.save();
}

function isFailedPayout(status) {
  return ['rejected', 'reversed', 'failed'].includes(status);
}

module.exports = {
  createPendingTransaction,
  handleFailedPayout,
  handleFailedPayoutRequest,
  updateWalletAndTransaction,
  isFailedPayout,
  handleProcessedPayout
}