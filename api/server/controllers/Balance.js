const Balance = require('../../models/Balance');

async function balanceController(req, res) {
  const {
    tokenCredits = '0',
    remainMonthlyTokenCredits = '0',
    monthlyTokenCredits = '0',
    plan = '0',
  } = (await Balance.findOne({ user: req.user.id }, [
    'tokenCredits',
    'monthlyTokenCredits',
    'remainMonthlyTokenCredits',
    'plan',
  ]).lean()) ?? {};

  res.status(200).send({
    balance: '' + tokenCredits,
    monthlyTokenCredits: '' + monthlyTokenCredits,
    remainMonthlyTokenCredits: '' + remainMonthlyTokenCredits,
    plan: '' + plan,
  });
}

module.exports = balanceController;
