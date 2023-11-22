const mongoose = require('mongoose')

const betSchema = new mongoose.Schema({
  betId: String,
  result: Number,
  userCount: {type: Number, default: 0},
  totalAmount: {type: Number, default: 0},
  payout: {type: Number},
  status: String,
  createdAt: {type: Date, default: Date.now}
})

const Bet = mongoose.model('Bet', betSchema);

module.exports = Bet;