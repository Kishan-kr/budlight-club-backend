const mongoose = require('mongoose')

const betJoinedSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  bet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bet'
  },
  betAmount: {type: Number, required: true},
  selectionType: String,
  selectedNumber: Number,
  selectedColor: String,
  fee: Number,
  netAmount: Number,
  status: String,
  winAmount: Number,
  joinedAt: {type: Date, default: Date.now}
})

const BetJoined = mongoose.model('BetJoined', betJoinedSchema);

module.exports = BetJoined;