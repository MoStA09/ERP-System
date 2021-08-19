const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CollectionStatementSchema = new Schema({
  clientId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref:'Client'
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref:'User' 
  },
  amount: {
    type: Number,
    required: true
  },
  state: {
    type: String,
    enum: ['on hold', 'accepted', 'rejected'],
    required: true
  },
  creationDate: {
    type: Date,
    required: true
  },
  history: [
    {
      date: {
        type: Date,
        required: true,
      },
      comment: {
        type: String,
        required: true,
        maxlength:280
      },
    },
  ]
});
module.exports = CollectionStatement = mongoose.model(
  'CollectionStatement',
  CollectionStatementSchema
);
