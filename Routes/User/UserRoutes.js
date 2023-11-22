const router = require('express').Router()
const CreateUser = require('./CreateUser')
const Login = require('./Login')
const GetUser = require('./GetUser')
const UpdateUser = require('./UpdateUser')
const DeleteUser = require('./DeleteUser')
const ChangePassword = require('./ChangePassword')
const ResetPassword = require('./ResetPassword')

// Combining all user routes 
router.use(CreateUser)
router.use(Login)
router.use(GetUser)
router.use(UpdateUser)
router.use(DeleteUser)
router.use(ChangePassword)
router.use(ResetPassword)

// export router object 
module.exports = router;