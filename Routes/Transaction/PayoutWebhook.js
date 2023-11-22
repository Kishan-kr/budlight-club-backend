const { validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils');
const { isFailedPayout, handleFailedPayout, handleProcessedPayout } = require('../../Utils/PayoutUtils');
const router = require('express').Router()
require('dotenv').config()
const secret = process.env.PAYOUT_WEBHOOK_SECRET;

router.post('/payout/webhook', async (req, res) => {
  let success = false;
  const signature = req.get('x-razorpay-signature');

  const io = req.app.get('io');//import socket io from app context

  try {
    // Verify the webhook signature
    const verified = validateWebhookSignature(JSON.stringify(req.body), signature, secret)
    if(!verified) {
      return res.status(400).json({success, error: 'Invalid webhook signature'});
    }

    const payout = req.body;
    const {status, amount, id, status_details} = payout.payload.payout.entity;

    if(isFailedPayout(status)) {
      handleFailedPayout(id, amount/100);
      return res.status(400).json({success, error: status_details.description})
    }
    else if (payout.event === 'payout.processed') {
      handleProcessedPayout(id, status);
      return res.status(200).json({success: true, message: status_details.description})
    } 

    // Respond with success
    res.status(200).send('Webhook received');
  } catch (error) {
    console.error('Error processing payout webhook:', error);
    return res.status(500).json({success, error: 'Error while processing payout'});
  }
})

module.exports = router;