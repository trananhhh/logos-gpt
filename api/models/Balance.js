const mongoose = require('mongoose');
const balanceSchema = require('./schema/balance');
const { getMultiplier, isTier1 } = require('./tx');
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
  const _isTier1 = isTier1({ model, endpointTokenConfig });

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
    (!_isTier1 || plan == '0')
  ) {
    return {
      canSpend: false,
      balance: 0,
      tokenCost,
      monthlyCredits: remainMonthlyTokenCredits,
    };
  }

  logger.debug('[Balance.check]', { tokenCost });

  return {
    canSpend:
      balance >= tokenCost || remainMonthlyTokenCredits >= tokenCost || (_isTier1 && plan !== '0'),
    balance,
    tokenCost,
    monthlyCredits: remainMonthlyTokenCredits,
  };
};

module.exports = mongoose.model('Balance', balanceSchema);
