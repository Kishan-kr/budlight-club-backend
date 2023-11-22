const mongoose = require('mongoose')

const payoutBankSchema = new mongoose.Schema({
  role: {type: String, default: 'Admin'},
  number : { type: String, required: true },
  mode : { 
    type: String,
    required: true 
  },
  minimumThreshold : {
    type : Number,
    required : true
  }
})

const PayoutBank = mongoose.model('PayoutBank', payoutBankSchema);
module.exports = PayoutBank;