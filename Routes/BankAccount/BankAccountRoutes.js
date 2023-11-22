const router = require('express').Router()

// import Bank account routes 
const CreateBankAccount = require('./CreateBankAccount')
const GetBankAccount = require('./GetBankAccount')
const DeleteBankAccount = require('./DeleteBankAccount')
const UpdateBankAccount = require('./UpdateBankAccount')

// Combine all bank account routes 
router.use(CreateBankAccount);
router.use(GetBankAccount);
router.use(DeleteBankAccount);
router.use(UpdateBankAccount);

module.exports = router;