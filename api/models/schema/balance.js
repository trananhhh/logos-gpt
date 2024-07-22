const mongoose = require('mongoose');

const balanceSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    required: true,
  },
  // 1000 tokenCredits = 1 mill ($0.001 USD)
  tokenCredits: {
    type: Number,
    default: 0,
  },
  ggTokenCredits: {
    type: Number,
    default: 0,
  },
  plan: {
    type: Number,
    default: 0,
  },
  // The amount of token credits the user will receive in the end of month.
  monthlyTokenCredits: {
    type: Number,
    default: 0,
  },
  remainMonthlyTokenCredits: {
    type: Number,
    default: 0,
  },
});

module.exports = balanceSchema;
