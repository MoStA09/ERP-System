const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const StoreTransactionSchema = new Schema({
  storeId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref:'Store'
  },
  subStoreId: {
    type: Schema.Types.ObjectId,
    required: false,
    ref:'SubStore'
  },
  direction: {
    type: String,
    enum: ['in', 'out'],
    required: true, 
  },
  products: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref:'Product'
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  comment: {
    type: String,
    maxlength: 280,
    required: true,
  },
  creationDate: {
    type: Date,
    required: true,
  },
  supplierId: {
    type: Schema.Types.ObjectId,
    required: false,
    ref:'Supplier'
  },
  storeDirectorId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref:"User"
  },
  price: {
    type: Number,
    required: true,
  },
});
module.exports = StoreTransaction = mongoose.model(
  'StoreTransaction',
  StoreTransactionSchema
);
