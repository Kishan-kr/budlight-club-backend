const authenticateToken = require('../../Middlwares/AuthenticateToken');
const Wallet = require('../../Models/Wallet');

const router = require('express').Router()

router.post('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  let success = false;

  Wallet.create({user: userId})
  .then((wallet) => {
    if(!wallet) {
      return res.status(400).json({success, error: 'Error creating wallet'})
    }

    success = true;
    res.status(200).json({success, wallet})
  })
  .catch((error) => {
    console.error('Error creating wallet: ', error);
    res.status(500).json({success, error: 'Error while creating wallet'})
  })
})

module.exports = router;