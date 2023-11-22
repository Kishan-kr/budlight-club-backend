const mongoose = require('mongoose')

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  transaction: {
    type: String
  },
  category: String,
  type: String,
  description: {
    type: String, 
    required: true
  },
  status: String,
  createdAt: {
    type: Date,
    expires: '60d',
    default: Date.now
  }
})

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;