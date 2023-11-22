const router = require('express').Router()

const CreateFeedback = require('./CreateFeedback');
const GetUserFeedback = require('./GetUserFeedbacks');

router.use(CreateFeedback);
router.use(GetUserFeedback);

module.exports = router;
