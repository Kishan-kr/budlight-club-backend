const router = require('express').Router()

// const CreateAdmin = require('./CreateAdmin')
const LoginAdmin = require('./LoginAdmin')
const GetAdmin = require('./GetAdmin')
const ChangePassword = require('./ChangePassword')
const ResetPassword = require('./ResetPassword')
const UpdateAdmin = require('./UpdateAdmin')
const UpdateBet = require('./UpdateBet')
const ViewJoinedUsers = require('./ViewJoinedUsers')
const GetBank = require('./GetBank')
const UpdateBank = require('./UpdateBank')
const GetAllFeedbacks = require('./GetAllFeedbacks')
const GetFeedback = require('./GetFeedback')
const UpdateFeedback = require('./UpdateFeedback')

// router.use(CreateAdmin);
router.use(LoginAdmin);
router.use(GetAdmin);
router.use(ChangePassword);
router.use(ResetPassword);
router.use(UpdateAdmin);
router.use(UpdateBet);
router.use(ViewJoinedUsers);
router.use(GetBank);
router.use(UpdateBank);
router.use(GetAllFeedbacks);
router.use(GetFeedback);
router.use(UpdateFeedback);

module.exports = router;