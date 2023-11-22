const mongoose = require('mongoose')

const adminSchema = new mongoose.Schema({
  role: {type: String, default: 'Admin'},
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
  }
})

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;