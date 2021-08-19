const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SupplierSchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  products: {
    type:[
      {
        productId: {
          type: Schema.Types.ObjectId,
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0
        },
      },
    ],
    default:[]
  }
});
module.exports = Supplier = mongoose.model('Supplier', SupplierSchema);
