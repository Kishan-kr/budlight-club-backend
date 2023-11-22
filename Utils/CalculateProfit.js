const BetJoined = require("../Models/BetJoined");
const AdminBank = require("../Models/AdminBank");

const colorMap = {
  'red': [0, 2, 4, 6, 8],
  'green': [1, 3, 5, 7, 9],
  'violet': [0, 5]
}
const initialAmount = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

// function to update profit in bank of admin 
async function updateBank(amount) {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  try {
    // find latest bank doc 
    const latestBankRecord = await AdminBank.findOne().sort({ createdAt: -1 });

    // if no record found, create new 
    if (!latestBankRecord || latestBankRecord === null) {
      console.log('latest bank record not found creating new')//testing
      const bankRecord = await AdminBank.create({});
      bankRecord.profit += Number(amount);
      await bankRecord.save();
      return;
    }

    // if record found is not of the same month and year then create new 
    const month = latestBankRecord.createdAt.getMonth();
    const year = latestBankRecord.createdAt.getFullYear();

    if (currentMonth !== month || currentYear !== year) {
      console.log('latest bank record month or year not match creating new...')//testing
      const bankRecord = await AdminBank.create({});
      bankRecord.profit += Number(amount);
      await bankRecord.save();
      return;
    }

    latestBankRecord.profit += Number(amount);
    await latestBankRecord.save();
  } catch (error) {
    console.error('Error updating Admin Bank record: ', error);
  }
}

// function to calculate profit from the last running bet 
async function calculateProfit(bet) {
  const potentialPayout = initialAmount;
  const { result, totalAmount, id } = bet;

  try {
    const allJoinedBets = await BetJoined.find({ bet: id });

    allJoinedBets.forEach(betJoined => {
      const { selectionType, betAmount } = betJoined;

      if (selectionType === 'number') {
        const { selectedNumber } = betJoined;
        potentialPayout[selectedNumber] += (betAmount * 3);
      }
      else if (selectionType === 'color') {
        const { selectedColor } = betJoined;

        colorMap[selectedColor].forEach(idx => {
          potentialPayout[idx] += (betAmount * 2)
        });
      }
    });

    const profit = totalAmount - potentialPayout[result];
    await updateBank(profit);
    return potentialPayout[result];

  } catch (error) {
    console.error('Error calculating profit: ', error);
  }
}

module.exports = calculateProfit;