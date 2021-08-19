const Expenses = require("../models/Expenses");
const ExpensesTransaction = require("../models/ExpensesTransaction");
const User = require("../models/User");
const objectId = require("mongoose").Types.ObjectId;
const { generatePdf } = require('../utils/generatePdf');
const { expenseTable } = require('../utils/expenseTable');

exports.addCategory = async function (req, res) { 

  try {

    const expenseName = req.body.name;
    if (!expenseName) {
      return res.send({ error: "برجاء التأكد من إدخال جميع البيانات" });
    }
    req.body.subcategory = [];
    req.body.field = [];
    const createdExpense = await Expenses.create(req.body);
    return res.send({ data: createdExpense });
  } catch (err) {
    return res.send({ error: err.toString() });
  }
};

exports.addSubCategory = async function (req, res) {

  try {

    const newSubCategoryName = req.body.name;
    if (!objectId.isValid(req.params.expenseId)) {
      return res.send({ error: "ExpensesId must be an ObjectId" });
    }
    if (!newSubCategoryName) {
      return res.send({ error: "برجاء التأكد من إدخال جميع البيانات" });
    }

    const selectedExpense = await Expenses.findOne({
      _id: req.params.expenseId,
    });

    if (!selectedExpense) {
      return res.send({ error: "هذه النفقات غير موجودة" });
    }
    const subCategoryArray = selectedExpense.subCategory;
    for (var i = 0; i < subCategoryArray.length; i++) {
      if (subCategoryArray[i].name == newSubCategoryName) {
        return res.send({ error: "هذا الاسم مكرر ، برجاء اختيار اسم مختلف" });
      }
    }
    const updatedExpense = await Expenses.findOneAndUpdate(
      { _id: req.params.expenseId },
      { $push: { subCategory: { name: req.body.name } } },
      { new: true }
    );
    return res.send({ data: updatedExpense });
  } catch (err) {
    return res.send({ error: err.toString() });
  }
};

//we need user authorization
exports.addField = async function (req, res) {
  try {
    const newFieldName = req.body.name;
    if (!objectId.isValid(req.params.expenseId)) {
      return res.send({ error: "ExpensesId must be an ObjectId" });
    }
    if (!newFieldName) {
      return res.send({ error: "برجاء التأكد من إدخال جميع البيانات" });
    }

    const selectedExpense = await Expenses.findOne( {_id: req.params.expenseId} );
    if (!selectedExpense) {
      return res.send({ error: "هذه النفقات غير موجودة" });
    }
    const fieldArray = selectedExpense.field;
    for (var i = 0; i < fieldArray.length; i++) {
      if (fieldArray[i].name == newFieldName) {
        return res.send({ error: "هذا الاسم مكرر ، برجاء اختيار اسم مختلف" });
      }
    }
    const updatedExpense = await Expenses.findOneAndUpdate(
      { _id: req.params.expenseId },
      { $push: { field: { name: newFieldName } } },
      { new: true }
    );
    return res.send({ data: updatedExpense });
  } catch (err) {
    return res.send({ error: err.toString() });
  }
};

exports.addExpensesTransaction = async function (req, res) {
try {
  const expensesId = req.params.expensesId;
  const subCategoryId = req.body.subCategoryId;
  const fieldId = req.body.fieldId;
  const amount = req.body.amount;
  req.body.userId = req.user._id
  
  if(!subCategoryId || !fieldId || !amount)
    return res.send({ error: "برجاء التأكد من إدخال جميع البيانات" });
  

  if (!objectId.isValid(expensesId)) 
    return res.send({ error: "expensesId must be an ObjectId" });
  

  if (!objectId.isValid(subCategoryId)) 
    return res.send({ error: "subCategoryId must be an ObjectId" });
  

  if (!objectId.isValid(fieldId)) 
    return res.send({ error: "fieldId must be an ObjectId" });

  const foundExpense = await Expenses.findById(expensesId);
  if (!foundExpense) 
    return res.send({ error: "Expense was not found" });

  const foundSubCategory = foundExpense.subCategory.find(subCategory => subCategory._id == subCategoryId);
  if (!foundSubCategory) 
    return res.send({ error: "Subcategory was not found" });

  const foundField = foundExpense.field.find(field => field._id == fieldId);
  if (!foundField) 
    return res.send({ error: "Field was not found" });

  if(amount<=0)
  return res.send({error: "عملية غير ناجحة :قيمة العملية يجب ان تكون اكثر من صفر",});

  req.body.date = new Date();
  req.body.expensesId = expensesId; 


  const createdExpenseTransaction = await ExpensesTransaction.create(req.body);
  return res.send({ data: createdExpenseTransaction });

} catch (err) { 
  return res.send({ error: err.message });
  }
}

exports.createPdfExpense  = async(req,res) => {  
  const id = req.params.id;
  if(!id) return res.send({error:'there is no params in the request'});

  try{
      const expenseTransaction = await ExpensesTransaction.findById(id).populate('expensesId');  
      if(!expenseTransaction) return res.send({error:'there is no expense transaction with that id'});
      const docDef = expenseTable(expenseTransaction);
      generatePdf(docDef,res); 
  }catch(err){
      res.send({error:err.toString()});
  }
   
};

exports.seeExpenseHistory = async (req,res) => {
  try{
    //aquire all the data from the parameters
    const expensesId =  req.params.expensesId;
    const subCatId = req.params.subCatId;
    const fieldId =  req.params.fieldId;
    const startDateString = req.params.startDate;
    const endDateString =  req.params.endDate;

    //initalizing the query, dates and the transaction
    let Query = {};

    const endDate =  new Date(endDateString);
    var expensesTransaction;

    //setting end time for the end of day to get all transactions
    endDate.setHours(23);
    endDate.setMinutes(59);
    endDate.setSeconds(59);

    if(!objectId.isValid(expensesId) && expensesId !== "all") return res.send({error: 'invalid expenses ID'})
    if(!objectId.isValid(subCatId) && subCatId !=='all') return res.send({error: 'invalid sub-category ID'})
    if(!objectId.isValid(fieldId) && fieldId !=='all') return res.send({error: 'invalid field ID'})

    //checking if start date is a specific date or to get all transactions since the first entery
    if(startDateString === 'all'){
      Query = { date: { $lte: endDate } };
    }else{
      var startDate = new Date(startDateString);
      Query = { date: { $lte: endDate, $gte: startDate } };
    }
    //checking the validaty of each id to ensure that none of them is sent as all
    var isIdExpenses = objectId.isValid(expensesId);
    var isIdField= objectId.isValid(fieldId);
    var isIdSubCat= objectId.isValid(subCatId);

    //find store transactions made by all stores with creation date between startDate & endDate
    if(isIdExpenses && isIdSubCat && isIdField){
      expensesTransaction = await ExpensesTransaction.find({$and: [Query, { expensesId: expensesId },{ subCategoryId: subCatId }, {fieldId: fieldId}] });
    }else if(isIdExpenses && isIdSubCat){
      expensesTransaction = await ExpensesTransaction.find({$and: [Query, { expensesId: expensesId },{ subCategoryId: subCatId }] });
    }else if(isIdExpenses && isIdField){
      expensesTransaction = await ExpensesTransaction.find({$and: [Query, { expensesId: expensesId }, {fieldId: fieldId}] });
    }else if(isIdExpenses){
      expensesTransaction = await ExpensesTransaction.find({$and: [Query, { expensesId: expensesId }] });
    }else if(expensesId === "all"){
      expensesTransaction = await ExpensesTransaction.find(Query);
    }else{
      return res.send({error: 'something went wrong'})
    }

    return res.send({ data: expensesTransaction });

  }catch(error){
    return res.send({error: error.toString()})
  }
};

exports.deleteExpense = async function (req, res) { 
  if (!objectId.isValid(req.params.expenseId)) {
    return res.send({ error: "expenseId must be an ObjectId" });
  }
  try {
   const expense = await Expenses.findByIdAndDelete(req.params.expenseId);
    return res.send({ data: expense });
  } catch (err) {
    return res.send({ error: err.toString() });
  }
};



