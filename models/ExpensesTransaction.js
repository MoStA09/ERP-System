const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ExpensesTransactionSchema = new Schema({
    expensesId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref : "Expenses"
      },
      subCategoryId: {
        type: Schema.Types.ObjectId,
        required: true
      },
      fieldId: {
        type: Schema.Types.ObjectId,
        required: true
      },
      date:{
          type : Date,
          required: true,
      },
      amount :{
            type :Number,
            required :true,
      },
      comment: {
          type: String,
          required:false,
          maxlength:280
      },
      userId: {
        type: Schema.Types.ObjectId,
        required: true
      }
});


module.exports = ExpensesTransaction = mongoose.model("ExpensesTransaction", ExpensesTransactionSchema);
