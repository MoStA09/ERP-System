const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const SafeSchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  currency: {
    type: String,
    enum: ["EGP", "USD", "EUR"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ["Safe", "Bank"],
    required: true,
  },
  deleted :{
    type :Boolean,
    default :false
  }
});

SafeSchema.pre(/^find(?!ByIdAndDelete)$/,  function (next) { 
  // this points to the current query
  this.find({ deleted: { $ne: true } });
  next();
});

module.exports = Safe = mongoose.model("Safe", SafeSchema);
