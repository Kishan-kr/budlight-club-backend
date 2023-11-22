const router = require('express').Router()
const CreateTransaction = require('./CreateTransaction')
const CreatePayment = require('./CreatePayment')
const GetTransaction = require('./GetTransaction')
const VerifyPayment = require('./VerifyPayment')
const PayoutToUser = require('./PayoutToUser')
const PayoutWebhook = require('./PayoutWebhook')

router.use(CreateTransaction)
router.use(GetTransaction)
router.use(CreatePayment)
router.use(VerifyPayment)
router.use(PayoutToUser)
router.use(PayoutWebhook)

module.exports = router;