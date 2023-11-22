const router = require('express').Router()

// import betjoined routes 
const CreateBetJoined = require('./CreateBetJoined')
const GetJoinedBets = require('./GetJoinedBets')

// combine all routes 
router.use(CreateBetJoined);
router.use(GetJoinedBets);

module.exports = router;