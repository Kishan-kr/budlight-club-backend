const jwt = require('jsonwebtoken')
require('dotenv').config()
const secret = process.env.JWT_SECRET

const authenticateToken = (req, res, next) => {
  let token = req.header('token');
  let success = false;

  // Return error token is not available 
  if(!token) {
    return res.status(401).json({success, error : "Unauthorized: Token is not available"})
  }

  // verify the token 
  jwt.verify(token, secret, (error, decoded) => {
    if(error){
      console.error("Unauthorized: ", error)
      return res.status(401).json({success, error: 'Unauthorized: Unable to verify token!'})
    }
    req.user = decoded;
    next()
  })
}

module.exports = authenticateToken;