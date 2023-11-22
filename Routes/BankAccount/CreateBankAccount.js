const { body, validationResult } = require('express-validator');
const authenticateToken = require('../../Middlwares/AuthenticateToken');
const shortUUID = require('short-uuid');
const { default: fetch } = require('node-fetch');
const BankAccount = require('../../Models/BankAccount');

const router = require('express').Router()

// Custom validation function for name field
const isAlphaAndSpace = value => {
  return /^[A-Za-z ]+$/.test(value);
};

// razorpay URLs to make post request 
const contactURL = "https://api.razorpay.com/v1/contacts";
const fundURL = "https://api.razorpay.com/v1/fund_accounts";

router.post('/', authenticateToken, [
  body('accountNumber', 'Account Number must not be empty').exists(),
  body('ifsc', 'IFSC code must not be empty').exists(),
  body('bankName', 'Bank Name must not be empty').exists()
    .custom(value => isAlphaAndSpace(value))
    .withMessage('Bank Name must not contain numbers'),
  body('holderName').custom(value => isAlphaAndSpace(value))
    .withMessage("Account Holder's Name must not contain numbers"),
  body('phone', "Phone is not valid").isMobilePhone('en-IN'),
  body('email', "Email is not valid").isEmail()
], async (req, res) => {
  const userId = req.user.id;
  let success = false;

  // destructure account details from request body 
  const {
    accountNumber, 
    bankName, 
    ifsc,
    holderName,
    phone,
    email,
    state,
    city
  } = req.body;

  // validation errors 
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    console.error("validation errors: ", errors.array())
    return res.status(400).json({success, error:errors.array()});
  }

  // create razorpay contact 

    // contact body object 
    const contactBody = {
    name: holderName,
    email,
    contact: phone,
    type:"customer",
    reference_id: shortUUID.generate(),
    notes:{
      user : userId,
    }
  }

  try {
    // Post request to create a razorpay contact 
    const contactResponse = await fetch(contactURL, {
      method: 'post',
      body: JSON.stringify(contactBody),
      headers: {'Content-Type': 'application/json'}
    });

    // return error if Unable to create razorpay contact 
    if(!contactResponse) {
      console.error('Error creating razorpay contact')
      return res.status(400).json({success, error: "Error creating razorpay contact"});
    }
    const contactData = await contactResponse.json();

    // create razorpay Fund account 
    const fundBody = {
      contact_id: contactData.id,
      account_type: "bank_account",
      bank_account:{
        name: holderName,
        ifsc,
        account_number: accountNumber
      }
    }

    // Post request to create razorpay Fund Account 
    const fundResponse = await fetch(fundURL, {
      method: 'post',
      body: JSON.stringify(fundBody),
      headers: {'Content-Type': 'application/json'}
    })

    // return error if Unable to create razorpay fund account 
    if(!fundResponse) {
      console.error('Error creating razorpay Fund Account')
      return res.status(400).json({success, error: "Error creating razorpay Fund Account"});
    }

    const fundData = await fundResponse.json();

    // save bank account in DB 
    const bankAccount = await BankAccount.create({
      bankName,
      accountNumber,
      ifsc,
      holderName,
      phone,
      contactId: contactData.id,
      fundAccountId: fundData.id,
      email,
      user: userId,
      state,
      city,
      active: fundData.active
    })

    if(!bankAccount) {
      console.error('Error creating Bank account');
      return res.status(500).json({success, error: 'Error creating Bank account'})
    }

    success = true;
    res.status(200).json({success, bankAccount});

  } catch (error) {
    console.error('Error creating Bank account: ', error)
    res.status(500).json({success, error: 'Error occurred while creating Bank account'})
  }
})

module.exports = router;