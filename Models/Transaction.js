const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  balance: Number,
  type: String,
  category: String,
  amount: {type: Number, required: true},
  status: String,
  commissionSource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
  },
  commissionLevel: {
    type: Number,
    enum: [1, 2], // Allow only levels 1 or 2
  },
  bank: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BankAccount'
  },
  razorpay_payout_id: String,
  razorpay_payment_id: String,
  razorpay_order_id: String,
  razorpay_method: String,
  createdAt: {type: Date, default: Date.now},
})

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;