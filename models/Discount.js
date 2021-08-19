const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const DiscountSchema = new Schema({
  clientId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  productId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
  },
});
module.exports = Discount = mongoose.model('Discount', DiscountSchema);
