const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const subStoreSchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  products: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  storeId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Store',
  },
  deleted: {
    type: Boolean,
    default: false
  }
});

//this middleware will start before any find method except (ByIdAndDelete) to exclude the deleted products 
subStoreSchema.pre(/^find(?!ByIdAndDelete)$/, function (next) {
  // this points to the current query
  this.find({ deleted: { $ne: true } });
  next();
});  

module.exports = subStore = mongoose.model('subStore', subStoreSchema);
