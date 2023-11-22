const router = require('express').Router()

// import wallet routes 
const CreateWallet = require('./CreateWallet')
const GetWallet = require('./GetWallet')

// combine wallet routes 
router.use(CreateWallet)
router.use(GetWallet)

module.exports = router;