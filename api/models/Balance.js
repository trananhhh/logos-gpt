const mongoose = require('mongoose');
const balanceSchema = require('./schema/balance');
const { getMultiplier, getTier } = require('./tx');
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
  const modelTier = getTier({ model, endpointTokenConfig });

  const tokenCost = amount * multiplier;
  const { tokenCredits: balance, plan } =
    (await this.findOne({ user }, ['tokenCredits', 'plan']).lean()) ?? {};
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

  if (
    // balance < tokenCost &&
    // (remainMonthlyTokenCredits ?? 0) < tokenCost &&
    balance <= 0 &&
    remainMonthlyTokenCredits <= 0 &&
    (modelTier != 1 || plan == '0')
  ) {
    return {
      canSpend: false,
      balance: 0,
      tokenCost,
      monthlyCredits: remainMonthlyTokenCredits,
    };
  }

  logger.debug('[Balance.check]', { tokenCost });
  logger.debug('===tokenCost', tokenCost);

  return {
    canSpend:
      balance >= tokenCost ||
      remainMonthlyTokenCredits >= tokenCost ||
      (modelTier === 1 && plan !== '0'),
    balance,
    tokenCost,
    monthlyCredits: remainMonthlyTokenCredits,
  };
};

module.exports = mongoose.model('Balance', balanceSchema);
