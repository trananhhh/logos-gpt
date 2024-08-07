const Balance = require('../../models/Balance');

async function balanceController(req, res) {
  const {
    tokenCredits = '0',
    remainMonthlyTokenCredits = '0',
    monthlyTokenCredits = '0',
    plan = '0',
    expiredAt,
  } = (await Balance.findOne({ user: req.user.id }, [
    'tokenCredits',
    'monthlyTokenCredits',
    'remainMonthlyTokenCredits',
    'plan',
    'expiredAt',
  ]).lean()) ?? {};

  res.status(200).send({
    balance: '' + tokenCredits,
    monthlyTokenCredits: '' + monthlyTokenCredits,
    remainMonthlyTokenCredits: '' + remainMonthlyTokenCredits,
    plan: '' + plan,
    expiredAt: expiredAt,
  });
}

module.exports = balanceController;
