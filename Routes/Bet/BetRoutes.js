const router = require('express').Router()

const GetBets = require('./GetBets');
const GetRunningBet = require('./GetRunningBet');

router.use(GetBets);
router.use(GetRunningBet);

module.exports = router;