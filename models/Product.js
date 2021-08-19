const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ProductSchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  tax: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  unit: {
    type: Number,
    required: true,
  },
  deleted:{
    type : Boolean,
    default: false,
  } 
});

//this middleware will start before any find method except (ByIdAndDelete) to exclude the deleted products 
ProductSchema.pre(/^find(?!ByIdAndDelete)$/, function (next) {
  // this points to the current query
  this.find({ deleted: { $ne: true } });
  next();
});  

module.exports = Product = mongoose.model('Product', ProductSchema);