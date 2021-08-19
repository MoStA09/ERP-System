const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const ChequeSchema = new Schema({
  amount: {
    type: Number,
    required: true,
  },
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
  safeId: {
    type: Schema.Types.ObjectId,
    ref:'Safe'
  },
  bankId: {
    type: Schema.Types.ObjectId
  },
  history: [
    {
      date: {
        type: Date,
        required: true
      },
      comment: {
        type: String,
        required: true,
        maxlength: 280
      }
    }],
  state: {
    type: String,
    enum: ["on hold", "rejected", "in safe", "in bank"],
    required: true
  },
  creationDate: {
    type: Date,
    required: true
  },
  collectionDate: {
    type: Date,
    required: true,
  },
});


ChequeSchema.methods.toJSON = function () {
  const Cheque = this;
  const publicCheque = Cheque.toObject();
  let todayTime = new Date(publicCheque.creationDate);
  let month = (todayTime.getMonth() + 1);
  let day = (todayTime.getDate());
  let year = (todayTime.getFullYear());
  publicCheque.creationDate = day + "/" + month + "/" +  year;
  todayTime = new Date(publicCheque.collectionDate);
  month = (todayTime.getMonth() + 1);
  day = (todayTime.getDate());
  year = (todayTime.getFullYear());
  publicCheque.collectionDate = day + "/" + month + "/" +  year;
  return publicCheque
}

module.exports = Cheque = mongoose.model("Cheque", ChequeSchema);
