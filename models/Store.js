const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StoreSchema = new Schema({
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
        ref:"Product"
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  deleted: {
    type: Boolean,
    default: false
  }
});

//this middleware will start before any find method except (ByIdAndDelete) to exclude the deleted stores 
StoreSchema.pre(/^find(?!ByIdAndDelete)$/, function (next) {
  // this points to the current query
  this.find({ deleted: { $ne: true } });
  next();
});  

module.exports = Store = mongoose.model('Store', StoreSchema);