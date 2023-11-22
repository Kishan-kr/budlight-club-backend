const authenticateAdmin = require('../../Middlwares/AuthenticateAdmin');
const AdminBank = require('../../Models/AdminBank');

const router = require('express').Router();

router.put('/bank', authenticateAdmin, async (req, res) => {
  let success = false;
  const { amount } = req.body;
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  try {
    // find latest bank doc 
    const latestBankRecord = await AdminBank.findOne({created: -1});
    
    // if no record found, create new 
    if(!latestBankRecord) {
      const bankRecord = await AdminBank.create({});
      bankRecord.profit += Number(amount);
      await bankRecord.save();
      success = true;
      return res.status(200).json({success, bankRecord})
    } 

    // if record found is not of the same month and year then create new 
    const month = latestBankRecord.createdAt.getMonth();
    const year = latestBankRecord.createdAt.getFullYear();

    if(currentMonth !== month || currentYear !== year) {
      const bankRecord = await AdminBank.create({});
      bankRecord.profit += Number(amount);
      await bankRecord.save();
      success = true;
      return res.status(200).json({success, bankRecord}) 
    }

    bankRecord.profit += Number(amount);
    await bankRecord.save();
    success = true;
    res.status(200).json({success, bankRecord: latestBankRecord});
  } catch(error) {
    console.error('Error updating Admin Bank record: ', error);
    res.status(501).json({success, error: "Error occurred while updating Admin Bank record"})
  }
})

module.exports = router;