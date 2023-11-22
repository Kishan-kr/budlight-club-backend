const razorpay = require('../../Utils/RazorpayInstance')
const authenticateToken = require('../../Middlwares/AuthenticateToken')
const router = require('express').Router()
const shortUUID = require('short-uuid');
const Transaction = require('../../Models/Transaction');

// Route to initiate a payment
router.post('/payment', authenticateToken, async (req, res) => {
  const user = req.user.id;
  const { amount, currency } = req.body;
  let success = false;
  const options = {
    amount: amount * 100, // Amount in paise (multiply by 100)
    currency,
    receipt: shortUUID.generate(), // Provide a unique identifier for the order
    notes: {
      user
    }
  }

  try {
    // Create a new payment order
    const order = await razorpay.orders.create(options);

    // Store order details in the Transaction model
    const transaction = new Transaction({
      user,
      razorpay_order_id: order.id,
      amount: order.amount / 100, // Convert amount back to rupees
      status: order.status,
      type: 'credit',
      category: 'recharge'
    });

    transaction.save();

    const orderResponse = { 
      id: order.id, 
      amount: order.amount/100, 
      currency: order.currency 
    };
    res.status(200).json({success: true, orderResponse});
    
  } catch (error) {
    console.error('Error creating payment: ', error);
    res.status(500).json({success, error: 'Error while creating payment'})
  }
});

module.exports = router;