const mongoose = require('mongoose');
const { isEnabled } = require('~/server/utils/handleText');
const transactionSchema = require('./schema/transaction');
const { getMultiplier, getMultiplierGG, getTier,getCacheMultiplier } = require('./tx');
const { logger } = require('~/config');
const Balance = require('./Balance');
const cancelRate = 1.15;
const discountRate = 0.65;

/** Method to calculate and set the tokenValue for a transaction */
transactionSchema.methods.calculateTokenValue = function () {
  if (!this.valueKey || !this.tokenType) {
    this.tokenValue = this.rawAmount;
  }

  const { valueKey, tokenType, model, endpointTokenConfig } = this;

  this.modelTier = getTier({ model, endpointTokenConfig });

  logger.debug('===modelTier', this.modelTier);

  // No discount for tier 3 models
  const multiplier =
    Math.abs(getMultiplier({ valueKey, tokenType, model, endpointTokenConfig })) *
    (this.modelTier <= 2 ? discountRate : 1);
  const multiplierGG = getMultiplierGG({ tokenType, model });

  logger.debug('===multiplier', multiplier);

  this.rate = multiplier;
  this.tokenValue = this.rawAmount * multiplier;

  logger.debug('===this.tokenValue', this.tokenValue);

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

/**
 * Static method to create a transaction and update the balance
 * @param {txData} txData - Transaction data.
 */
transactionSchema.statics.create = async function (txData) {
  const Transaction = this;

  const transaction = new Transaction(txData);
  transaction.endpointTokenConfig = txData.endpointTokenConfig;
  transaction.calculateTokenValue();

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

  const isFreeTier = balance?.plan != 0 && transaction?.modelTier === 1;

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

/**
 * Static method to create a structured transaction and update the balance
 * @param {txData} txData - Transaction data.
 */
transactionSchema.statics.createStructured = async function (txData) {
  const Transaction = this;

  const transaction = new Transaction({
    ...txData,
    endpointTokenConfig: txData.endpointTokenConfig,
  });

  transaction.calculateStructuredTokenValue();

  await transaction.save();

  if (!isEnabled(process.env.CHECK_BALANCE)) {
    return;
  }

  let balance = await Balance.findOne({ user: transaction.user }).lean();
  let incrementValue = transaction.tokenValue;

  if (balance && balance?.tokenCredits + incrementValue < 0) {
    incrementValue = -balance.tokenCredits;
  }

  balance = await Balance.findOneAndUpdate(
    { user: transaction.user },
    { $inc: { tokenCredits: incrementValue } },
    { upsert: true, new: true },
  ).lean();

  return {
    rate: transaction.rate,
    user: transaction.user.toString(),
    balance: balance.tokenCredits,
    [transaction.tokenType]: incrementValue,
  };
};

/** Method to calculate token value for structured tokens */
transactionSchema.methods.calculateStructuredTokenValue = function () {
  if (!this.tokenType) {
    this.tokenValue = this.rawAmount;
    return;
  }

  const { model, endpointTokenConfig } = this;

  if (this.tokenType === 'prompt') {
    const inputMultiplier = getMultiplier({ tokenType: 'prompt', model, endpointTokenConfig });
    const writeMultiplier =
      getCacheMultiplier({ cacheType: 'write', model, endpointTokenConfig }) ?? inputMultiplier;
    const readMultiplier =
      getCacheMultiplier({ cacheType: 'read', model, endpointTokenConfig }) ?? inputMultiplier;

    this.rateDetail = {
      input: inputMultiplier,
      write: writeMultiplier,
      read: readMultiplier,
    };

    const totalPromptTokens =
      Math.abs(this.inputTokens || 0) +
      Math.abs(this.writeTokens || 0) +
      Math.abs(this.readTokens || 0);

    if (totalPromptTokens > 0) {
      this.rate =
        (Math.abs(inputMultiplier * (this.inputTokens || 0)) +
          Math.abs(writeMultiplier * (this.writeTokens || 0)) +
          Math.abs(readMultiplier * (this.readTokens || 0))) /
        totalPromptTokens;
    } else {
      this.rate = Math.abs(inputMultiplier); // Default to input rate if no tokens
    }

    this.tokenValue = -(
      Math.abs(this.inputTokens || 0) * inputMultiplier +
      Math.abs(this.writeTokens || 0) * writeMultiplier +
      Math.abs(this.readTokens || 0) * readMultiplier
    );

    this.rawAmount = -totalPromptTokens;
  } else if (this.tokenType === 'completion') {
    const multiplier = getMultiplier({ tokenType: this.tokenType, model, endpointTokenConfig });
    this.rate = Math.abs(multiplier);
    this.tokenValue = -Math.abs(this.rawAmount) * multiplier;
    this.rawAmount = -Math.abs(this.rawAmount);
  }

  if (this.context && this.tokenType === 'completion' && this.context === 'incomplete') {
    this.tokenValue = Math.ceil(this.tokenValue * cancelRate);
    this.rate *= cancelRate;
    if (this.rateDetail) {
      this.rateDetail = Object.fromEntries(
        Object.entries(this.rateDetail).map(([k, v]) => [k, v * cancelRate]),
      );
    }
  }
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
