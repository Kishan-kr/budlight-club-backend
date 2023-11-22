const mongoose = require('mongoose')

const AdminBankSchema = new mongoose.Schema({
  profit: {type: Number, default: 0},
  createdAt: {type: Date, default: Date.now}
})

const AdminBank = mongoose.model('AdminBank', AdminBankSchema);

module.exports = AdminBank;