const { body, validationResult } = require('express-validator');
const authenticateToken = require('../../Middlwares/AuthenticateToken');
const BankAccount = require('../../Models/BankAccount');
const { default: fetch } = require('node-fetch');

const router = require('express').Router()

// contact URL 
const contactURL = 'https://api.razorpay.com/v1/contacts'

router.put('/:id', authenticateToken, [
  body('phone', 'Phone is not valid').isMobilePhone('en-IN'),
], async (req, res) => {
  const accountId = req.params.id
  let success = false;

  // destructure update fields from request body 
  const {state, city, phone} = req.body;

  // validation errors 
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    console.error("validation errors while updating Bank account: ", errors.array())
    return res.status(400).json({success, error:errors.array()});
  }

  // create contact object to update razorpay contact 
  let contactBody = {contact: phone}

  try {
    const bankAccount = await BankAccount.findById(accountId);

    if(!bankAccount) {
      return res.status(400).json({success, error: 'Bank account not found'})
    }

    // Update razorpay contact 
    if(contactBody.email || contactBody.contact) {
      const contactResponse = await fetch(`${contactURL}/${bankAccount.contactId}`,{
        method: 'patch',
        body: JSON.stringify(contactBody),
        headers: {'Content-Type': 'application/json'}
      })

      if(!contactResponse) {
        console.error('Error updating razorpay contact')
        return res.status(400).json({success, error: 'Error Updating Bank account'})
      }

      contactData = await contactResponse.json();
      bankAccount.phone = contactData.contact;
    }
    // Update bank account in DB 
    bankAccount.state = state;
    bankAccount.city = city;

    await bankAccount.save();
    res.status(200).json({success: true, bankAccount})

  } catch (error) {
      console.error('Error updating Bank account: ', error)
      res.status(500).json({success, error: 'Error occurred while updating Bank account'})
  }
})

module.exports = router;