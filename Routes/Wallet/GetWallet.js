const router = require('express').Router()
const authenticateToken = require('../../Middlwares/AuthenticateToken');
const Wallet = require('../../Models/Wallet');


router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  let success = false;

  try {
    const wallet = await Wallet.findOne({user: userId});

    if(!wallet) {
      console.error('Wallet not found');
      return res.status(400).json({success, error: 'Wallet not found'})  
    }

    success = true;
    res.status(200).json({success, wallet});

  } catch (error) {
    console.error('Error fetching wallet: ', error);
    res.status(500).json({success, error: 'Error while fetching wallet'})
  }
})

module.exports= router;