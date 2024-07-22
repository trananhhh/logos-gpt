const mongoose = require('mongoose');
const balanceSchema = require('./schema/balance');
const { getMultiplier } = require('./tx');
const { logger } = require('~/config');

balanceSchema.statics.check = async function ({
  user,
  model,
  endpoint,
  valueKey,
  tokenType,
  amount,
  endpointTokenConfig,
}) {
  const multiplier = getMultiplier({ valueKey, tokenType, model, endpoint, endpointTokenConfig });
  const tokenCost = amount * multiplier;
  const { tokenCredits: balance } = (await this.findOne({ user }, 'tokenCredits').lean()) ?? {};
  const { remainMonthlyTokenCredits } =
    (await this.findOne({ user }, 'remainMonthlyTokenCredits').lean()) ?? {};

  logger.debug('[Balance.check]', {
    user,
    model,
    endpoint,
    valueKey,
    tokenType,
    amount,
    balance,
    multiplier,
    endpointTokenConfig: !!endpointTokenConfig,
    remainMonthlyTokenCredits,
  });

  if (balance < tokenCost && (remainMonthlyTokenCredits ?? 0) < tokenCost) {
    return {
      canSpend: false,
      balance: 0,
      tokenCost,
      monthlyCredits: remainMonthlyTokenCredits,
    };
  }

  logger.debug('[Balance.check]', { tokenCost });

  return {
    canSpend: balance >= tokenCost || remainMonthlyTokenCredits >= tokenCost,
    balance,
    tokenCost,
    monthlyCredits: remainMonthlyTokenCredits,
  };
};

module.exports = mongoose.model('Balance', balanceSchema);
