const Wallet = require('../Models/Wallet');
const Transaction = require('../Models/Transaction');

async function creditInterest() {
  try {
    const usersWithThresholdBalance = await Wallet.find({ balance: { $gte: 500 } });
  
    for (const userWallet of usersWithThresholdBalance) {
      // Calculate 8% of the current balance
      const creditedAmount = userWallet.balance * 0.08;
  
      // Update the wallet balance
      userWallet.balance += creditedAmount;
      userWallet.totalInterest += creditedAmount;
      await userWallet.save();

      // Create a transaction record for the credited interest
      const transaction = new Transaction({
        user: userWallet.user, 
        balance: userWallet.balance,
        type: 'credit',
        category: 'interest',
        amount: creditedAmount,
        status: 'credited'
      });
      await transaction.save();
    }
  
    console.log('Wallets credited successfully.');
  } catch (error) {
    console.error('Error crediting wallets:', error);
  }
}

module.exports = creditInterest;

