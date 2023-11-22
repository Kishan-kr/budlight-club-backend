const BetJoined = require('../Models/BetJoined')
const Transaction = require('../Models/Transaction')
const Wallet = require('../Models/Wallet')

const colorMap = {
  'violet': [0, 5],
  'red': [0, 2, 4, 6, 8],
  'green': [1, 3, 5, 7, 9]
}

async function updateWalletAndReturnBalance(user, amount) {
  try {
    const wallet = await Wallet.findOne({user});
    if(!wallet) {
      console.log("User's wallet not found while declaring bet result")
      return;
    }

    // calculate balance, update it and save it
    wallet.balance += amount;
    await wallet.save();

    // return the balance to createTransaction function 
    return wallet.balance;

  } catch (error) {
    console.error("Error updating wallet while declaring bet result: ", error)
  }
}

async function createTransaction(user, amount) {
  try {
    const transaction = Transaction.create({
      user,
      balance: await updateWalletAndReturnBalance(user, amount),
      type: 'credit',
      category: 'betting',
      amount,
      status: 'success'
    })
  } catch (error) {
    console.log("Error creating transaction after winning bet: ", error)// also return this error
  }
}

async function updateBetJoined(betId, result) {
  try {
    const allJoinedBets = await BetJoined.find({ bet: betId });
    if (!allJoinedBets.length)
    return;
  
  let winAmount = 0;
  let status = 'lost';
    // find who won and lost, update BetJoined and create transaction if won
    allJoinedBets.forEach(async (joinedBet) => {
      if (joinedBet.selectionType === 'number' && joinedBet.selectedNumber === result) {
        winAmount = joinedBet.netAmount * 3;
        status = 'won';
        createTransaction(joinedBet.user, winAmount);
      }
      else if (joinedBet.selectionType === 'color' && colorMap[joinedBet.selectedColor].includes(result)) {
        winAmount = joinedBet.netAmount * 2;
        status = 'won';
        createTransaction(joinedBet.user, winAmount);
      }

      // save updated joined bets 
      joinedBet.winAmount = winAmount;
      joinedBet.status = status;
      await joinedBet.save();

    })
  } catch (error) {
    console.error("Error searching joinedBets while declaring bet result", error)
  }

}

module.exports = updateBetJoined;