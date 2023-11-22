const Transaction = require("../Models/Transaction");
const Wallet = require("../Models/Wallet");

async function handleFailedPayment(status, order_id) {
  const transaction = await Transaction.findOne({razorpay_order_id: order_id});
  const user = transaction.user;
  transaction.status = status;

  // fetch user wallet to show balance
  const userWallet = await Wallet.findOne({user}).select('balance');

  // add balance in transaction history 
  transaction.balance = userWallet.balance;
  await transaction.save();

  return transaction;
}

function isFailedPayment(status) {
  return ['refunded', 'failed'].includes(status);
}

async function handleCapturedPayment(payment) {
  // Retrieve transaction using order id 
  const transaction = await Transaction.findOne({razorpay_order_id: payment.order_id});
  const user = transaction.user;

  // Retrieve wallet info 
  const userWallet = await Wallet.findOne({user})

  // calculate balance 
  const newBalance = userWallet.balance + (payment.amount / 100);

  // update wallet balance and save
  userWallet.balance = newBalance;
  await userWallet.save();

  // update transaction document and save
  transaction.razorpay_payment_id = payment.id;
  transaction.razorpay_order_id = payment.order_id;
  transaction.razorpay_method = payment.method;
  transaction.balance = newBalance;
  transaction.status = payment.status;

  await transaction.save();
  return {userWallet, transaction};
}

module.exports = {handleFailedPayment, isFailedPayment, handleCapturedPayment};