const router = require('express').Router();

const GetAccount = require('./GetAccount')
const SetAccount = require('./SetAccount')

router.use(GetAccount)
router.use(SetAccount)

module.exports = router;