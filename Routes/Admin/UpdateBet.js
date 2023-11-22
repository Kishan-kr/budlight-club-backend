const authenticateAdmin = require('../../Middlwares/AuthenticateAdmin');
const Bet = require('../../Models/Bet');

const router = require('express').Router()

router.put('/set-result/:betId', authenticateAdmin, async (req, res) => {
  const betId = req.params.betId;
  let success = false;
  const {result} = req.body;

  try {
    const bet = await Bet.findOne({betId});

    if(!bet) {
      console.error('Bet not found');
      return res.status(400).json({success, error: 'Bet not found'})
    }

    if(bet.status === 'finished') {
      console.error('Bet is already finished')
      return res.status(400).json({success, error: 'Bet is already finished'})
    }

    bet.result = result;
    await bet.save();

    success = true;
    res.status(200).json({success, message: 'Result set successfully'})
  } catch (error) {
    console.error('Error setting bet result: ', error);
    res.status(200).json({success, error: 'Error occur while setting bet result'})
  }
})

module.exports = router;