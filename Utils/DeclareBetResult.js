const Bet = require("../Models/Bet");
const calculateProfit = require("./CalculateProfit");
const updateBetJoined = require("./UpdateBetJoined");

async function declareResult(io, betId) {
  try {
    // retrieve bet 
    const bet = await Bet.findById(betId);

    // set random result if Admin has not set
    if(!bet.result || bet.result === undefined) {
      const randomNumber = getRandomNumber(0,9);
      bet.result = randomNumber;
    }
    
    // Update the bet with the result and save
    bet.status = 'finished';
    await bet.save()

    // update user's BetJoined doc and wallet based on result
    updateBetJoined(bet.id, bet.result);

    // calculate profit and update admin's bank 
    const payout = await calculateProfit(bet);

    // update payout in bet 
    bet.payout = payout;
    await bet.save();

    // Emit the event to inform users and admin about the result declaration
    io.emit('betResultDeclared', bet);

  } catch (error) {
    console.error('Error declaring result:', error);
  }
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = declareResult;