const mongoose = require('mongoose');
const { isEnabled } = require('../server/utils/handleText');
const transactionSchema = require('./schema/transaction');
const { getMultiplier, getMultiplierGG, isTier1 } = require('./tx');
const { logger } = require('~/config');
const Balance = require('./Balance');
const cancelRate = 1.15;

// Method to calculate and set the tokenValue for a transaction
transactionSchema.methods.calculateTokenValue = function () {
  if (!this.valueKey || !this.tokenType) {
    this.tokenValue = this.rawAmount;
  }
  const { valueKey, tokenType, model, endpointTokenConfig } = this;
  const multiplier = Math.abs(getMultiplier({ valueKey, tokenType, model, endpointTokenConfig }));
  const multiplierGG = getMultiplierGG({ tokenType, model });

  this.rate = multiplier;
  this.tokenValue = this.rawAmount * multiplier;
  this.isTier1 = isTier1({ model, endpointTokenConfig });

  // GPT-God
  this.ggRate = multiplierGG.value ?? 1;
  this.ggTokenValue =
    multiplierGG.per === 'time'
      ? -1 * multiplierGG.value
      : Math.round(this.rawAmount * (multiplierGG.value ?? 1));

  // GPT-God
  if (this.context && this.tokenType === 'completion' && this.context === 'incomplete') {
    this.tokenValue = Math.ceil(this.tokenValue * cancelRate);
    this.rate *= cancelRate;
  }
};

// Static method to create a transaction and update the balance
transactionSchema.statics.create = async function (transactionData) {
  const Transaction = this;

  const transaction = new Transaction(transactionData);
  transaction.endpointTokenConfig = transactionData.endpointTokenConfig;
  transaction.calculateTokenValue();

  // Save the transaction
  await transaction.save();

  if (!isEnabled(process.env.CHECK_BALANCE)) {
    return;
  }

  let balance = await Balance.findOne({ user: transaction.user }).lean();
  let incrementValue = transaction.tokenValue;
  let ggIncrementValue = transaction.ggTokenValue;

  const isMonthlyCredits = balance?.remainMonthlyTokenCredits > 0;

  // The last time will use all of the credit, even when it's not enough
  const tokenCreditsReduce =
    balance && balance.tokenCredits + incrementValue < 0 ? -balance?.tokenCredits : incrementValue;
  const monthlyCreditReduce =
    balance && balance.remainMonthlyTokenCredits + incrementValue < 0
      ? -balance?.remainMonthlyTokenCredits
      : incrementValue;

  const isFreeTier = balance?.plan != 0 && transaction?.isTier1;

  balance = await Balance.findOneAndUpdate(
    { user: transaction.user },
    {
      $inc: {
        tokenCredits: !isMonthlyCredits && !isFreeTier ? tokenCreditsReduce : 0,
        remainMonthlyTokenCredits: isMonthlyCredits && !isFreeTier ? monthlyCreditReduce : 0,
        ggTokenCredits: ggIncrementValue,
      },
    },
    { upsert: true, new: true },
  ).lean();

  return {
    rate: transaction.rate,
    user: transaction.user.toString(),
    balance: balance.tokenCredits,
    remainMonthlyTokenCredits: balance.remainMonthlyTokenCredits,
    [transaction.tokenType]: incrementValue,
  };
};

const Transaction = mongoose.model('Transaction', transactionSchema);

/**
 * Queries and retrieves transactions based on a given filter.
 * @async
 * @function getTransactions
 * @param {Object} filter - MongoDB filter object to apply when querying transactions.
 * @returns {Promise<Array>} A promise that resolves to an array of matched transactions.
 * @throws {Error} Throws an error if querying the database fails.
 */
async function getTransactions(filter) {
  try {
    return await Transaction.find(filter).lean();
  } catch (error) {
    logger.error('Error querying transactions:', error);
    throw error;
  }
}

module.exports = { Transaction, getTransactions };
