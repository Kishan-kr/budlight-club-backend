const Transaction = require('../Models/Transaction');
const User = require('../Models/User');
const Wallet = require('../Models/Wallet');

async function distributeCommissions(userId, rechargeAmount, originalTransactionId) {
  try {
    // Retrieve user's information (child user)
    const user = await User.findById(userId).select('-password -phone -email');

    if (!user) {
      console.error(`User with ID ${userId} not found`);
      return;
    }

    // Calculate commission for parent user (30%)
    if (user.refByCode && user.refByCode !== null) {
      const parentUser = await User.findOne({ registerCode: user.refByCode }).select('-password -phone -email');
      
      if(!parentUser) {
        console.error('Unable to retrieve parent User while distributing commission')
        return;
      }

      if (parentUser) {
        const parentWallet = await Wallet.findOne({ user: parentUser.id });
        if (parentWallet) {
          const parentCommission = rechargeAmount * 0.3;
          parentWallet.totalCommission += parentCommission;
          parentWallet.balance += parentCommission;
          await parentWallet.save();

          // Create a commission transaction for the parent
          const parentCommissionTransaction = new Transaction({
            user: parentWallet.user,
            amount: parentCommission,
            balance: parentWallet.balance,
            type: 'credit',
            category: 'commission',
            status: 'captured',
            commissionSource: originalTransactionId,
            commissionLevel: 1,
          });
          await parentCommissionTransaction.save();
        }

        // Calculate commission for grandparent user (10%)
        if (parentUser.refByCode) {
          const grandparent = await User.findOne({ registerCode: parentUser.refByCode }).select('-password -phone -email')

          if(!grandparent) {
            console.error('Unable to retrieve grandparent User while distributing commission')
            return;
          }

          const grandparentWallet = await Wallet.findOne({ user: grandparent.id });
          if (grandparentWallet) {
            const grandparentCommission = rechargeAmount * 0.1;
            grandparentWallet.totalCommission += grandparentCommission;
            grandparentWallet.balance += grandparentCommission;
            await grandparentWallet.save();

            // Create a commission transaction for the grandparent
            const grandparentCommissionTransaction = new Transaction({
              user: grandparentWallet.user,
              amount: grandparentCommission,
              balance: grandparentWallet.balance,
              type: 'credit',
              category: 'commission',
              status: 'captured',
              commissionSource: originalTransactionId,
              commissionLevel: 2,
            });
            await grandparentCommissionTransaction.save();
          }
        }
      }
    }
  } catch (error) {
    console.error('Error distributing commissions:', error);
  }
}

module.exports = distributeCommissions;
