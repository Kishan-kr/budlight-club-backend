const mongoose = require('mongoose')

const accountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  contactId: String,
  fundAccountId: String,
  bankName : {type: String, required: true},
  accountNumber : {type: String, required: true},
  ifsc : {type: String, required: true},
  holderName : {type: String, required: true},
  phone: {type: String, required: true},
  state: {type: String},
  city: {type: String},
  email: String,
  active: Boolean
})

const BankAccount = mongoose.model('BankAccount', accountSchema);

module.exports = BankAccount;