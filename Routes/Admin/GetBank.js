const authenticateAdmin = require('../../Middlwares/AuthenticateAdmin');
const AdminBank = require('../../Models/AdminBank');

const router = require('express').Router();

router.get('/bank', authenticateAdmin, async (req, res) => {
  let success = false;
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  try {
    // find latest bank doc 
    const latestBankRecord = await AdminBank.findOne().sort({ createdAt: -1 });
    
    // if no record found, create new 
    if(!latestBankRecord) {
      console.log('latest bank record not found while fetching bank...')//testing
      const bankRecord = await AdminBank.create({});
      success = true;
      return res.status(200).json({success, bankRecord})
    } 

    // if record found is not of the same month and year then create new 
    const month = latestBankRecord.createdAt.getMonth();
    const year = latestBankRecord.createdAt.getFullYear();

    if(currentMonth !== month || currentYear !== year) {
      console.log('latest bank record not match while fetching bank...')//testing
      const bankRecord = await AdminBank.create({});
      success = true;
      return res.status(200).json({success, bankRecord}) 
    }

    success = true;
    res.status(200).json({success, bankRecord: latestBankRecord});
  } catch(error) {
    console.error('Error Fetching Admin Bank record: ', error);
    res.status(501).json({success, error: "Error occurred while Fetching Admin Bank record"})
  }
})

module.exports = router;