const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name : { type: String, required: true },
  profilePic : { type: String, },
  phone : { 
    type: String,
    unique: true,
    required: true 
  },
  email : String,
  password : {
    type : String,
    required : true
  },
  registerCode: String,
  refByCode: String
})

const User = mongoose.model('User', userSchema);
module.exports = User;