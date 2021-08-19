const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const SafeBankTransactionSchema = new Schema({
  safeId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref:'Safe',
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref:'User'
  },
  direction: {
    type: String,
    required: true,
    enum: ["in", "out"],
  },
  type: {
    type: String,
    required: true,
    enum: ["cash", "cheque"],
  },
  comment: {
    type: String,
    maxlength: 280,
  },
  creationDate: {
    type: Date,
    required: true
  },
  amount: {
    type: Number,
    required: true,
  },
});

module.exports = SafeBankTransaction = mongoose.model(
  "SafeBankTransaction",
  SafeBankTransactionSchema
);
