const { default: fetch } = require('node-fetch');
const authenticateToken = require('../../Middlwares/AuthenticateToken');
const BankAccount = require('../../Models/BankAccount');

const router = require('express').Router()

const contactURL = 'https://api.razorpay.com/v1/contacts'
const fundURL = 'https://api.razorpay.com/v1/fund_accounts'

router.delete('/:id', authenticateToken, async (req, res) => {
  const accountId = req.params.id;
  let success = false;

  try {
    const bankAccount = await BankAccount.findById(accountId)

    if (!bankAccount) {
      console.error('Bank account not found')
      return res.status(400).json({ success, error: 'Error deleting bank account' })
    }

    //  De-activate razorpay contact 
    fetch(`${contactURL}/${bankAccount.contactId}`, {
      method: 'patch',
      body: JSON.stringify({ active: false }),
      headers: { 'Content-Type': 'application/json' }
    })

    //  De-activate razorpay fund account 
    fetch(`${fundURL}/${bankAccount.fundAccountId}`, {
      method: 'patch',
      body: JSON.stringify({ active: false }),
      headers: { 'Content-Type': 'application/json' }
    })

    //  delete bank account from DB 
    const deletedAccount = await BankAccount.findByIdAndDelete(accountId)

    if (!deletedAccount) {
      console.error('Unable to delete Bank account')
      return res.status(400).json({ success, error: 'Error while deleting bank account' })
    }

    success = true;
    res.status(200).json({ success, deletedAccount })

  } catch (error) {
    console.error('Error deleting Bank account: ', error)
    res.status(500).json({ success, error: 'Error occurred while deleting Bank account' })
  }
})

module.exports = router;