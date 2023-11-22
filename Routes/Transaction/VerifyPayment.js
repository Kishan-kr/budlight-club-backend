const router = require('express').Router();
const razorpay = require('../../Utils/RazorpayInstance');
const distributeCommissions = require('../../Utils/DistributeCommissions');
const {validateWebhookSignature} = require('razorpay/dist/utils/razorpay-utils');
const { handleFailedPayment, isFailedPayment, handleCapturedPayment } = require('../../Utils/PaymentUtils');
require('dotenv').config()
const secret = process.env.PAYMENT_WEBHOOK_SECRET 

// Route to handle payment verification webhook
router.post('/verify-payment', async (req, res) => {
  let success = false;

  // Access the io instance from app context
  const io = req.app.get('io')

  console.log('tried accessing payment verify endpoint')
  try {
    const signature = req.get('x-razorpay-signature');

    // Verify the webhook signature
    const verified = validateWebhookSignature(JSON.stringify(req.body), signature, secret)
    if(!verified) {
      return res.status(400).json({success, error: 'Invalid webhook signature'});
    }

    // Payment verification and handling logic
    const paymentId = req.body.payload.payment.entity.id;
    const payment = await razorpay.payments.fetch(paymentId);

    // handle failed payment 
    if(isFailedPayment(payment.status)) {
      const transaction = await handleFailedPayment(payment.status, payment.order_id);

      // socket.io event to push transaction to the user 
      io.emit('rechargeFailed', transaction);

      return res.status(400).json({success, error: payment.error_description, transaction})
    }

    if (payment.status === 'captured') {
      const walletAndTransaction = await handleCapturedPayment(payment);
      const {transaction} = walletAndTransaction;

      // distributing commission to the referrers 
      distributeCommissions(transaction.user, transaction.amount, transaction.id);

      // socket.io event to push wallet and transaction to the user 
      io.emit('rechargeSucceed', walletAndTransaction);

      return res.status(200).json({success: true, transaction});
    } else {
      console.log('Payment verification failed:', payment);
      return res.status(400).json({success, error: 'Payment verification failed'});
    }
  } catch (error) {
    console.error('Error processing payment webhook:', error);
    return res.status(500).json({success, error: 'Error while verifying payment'});
  }
});

module.exports = router;