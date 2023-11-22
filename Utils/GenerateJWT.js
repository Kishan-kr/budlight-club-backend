const jwt = require('jsonwebtoken')
require('dotenv').config()
const secret = process.env.JWT_SECRET 
const adminSecret = process.env.ADMIN_JWT_SECRET 

function generateJWT(payload) {
  return jwt.sign(payload, secret);
}

function generateAdminJWT(payload) {
  return jwt.sign(payload, adminSecret);
}

module.exports = {generateJWT, generateAdminJWT};