const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ExpensesSchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  subCategory: [
    {
      name: {
        type: String,
        required: true,
      },
    },
  ],
  field: [
    {
      name: {
        type: String,
        required: true,
      },
    },
  ],
});
module.exports = Expenses = mongoose.model("Expenses", ExpensesSchema);
