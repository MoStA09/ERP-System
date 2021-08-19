const User = require("../models/User");
const Safe = require("../models/Safe");
const SafeBankTransaction = require("../models/SafeBankTransaction");
const objectId = require("mongoose").Types.ObjectId;
const { safeTable } = require('../utils/safeTable');
const { generatePdf } = require('../utils/generatePdf');


exports.createSafe = async (req, res) => {
  try {

    const safename = req.body.name;
    const currency = req.body.currency;

    req.body.amount = 0;
    const type = req.body.type;

    if (!safename || !currency || !type)
      return res.send({ error: "Missing some requirments!" });
    req.body.deleted=false;

    const safe = await Safe.create(req.body);
    return res.send({ data: safe });
  } catch (e) {
    if (e.code && e.code == "11000") {
      return res.send({ error: "تم استخدام اسم الخزنة من قبل" });
    }
    return res.send({ error: e.message });
  }
};

// Accountant add money to safe.
exports.addMoneyToSafe = async (req, res) => {
  try {
    const userId = req.user._id;
    const safeId = req.params.safeId;

    // ID checks
    if (!objectId.isValid(safeId)) {
      return res.send({ error: "safeId must be an objectId" });
    }

    // Get Safe
    const safe = await Safe.findById(safeId);

    // Check if safe is valid
    if (!safe) 
      return res.send({ error: "Couldn't find a safe with that Id" });
    else if (safe.deleted) 
      return res.send({error:"Safe is temporarily deleted"});

    // Get current amount in safe.
    const currentAmount = safe.amount;

    // Set default parameters
    req.body.direction = "in";
    req.body.creationDate = new Date();

    // Extract attributes from request body.
    const { direction, type, comment, creationDate, amount } = req.body;

    if (!type || !amount)
      return res.send({ error: "برجاء إدخال جميع البيانات" });

    if (amount <= 0)
      return res.send({
        error: "Amount must be a positive number greater than zero",
      });

    const updatedSafe = await Safe.findOneAndUpdate(
      { _id: safeId },
      { amount: eval(currentAmount) + eval(amount) },
      { new: true }
    );

    // Save transaction to SafeBankTransaction Model.
    const safeTransaction = await SafeBankTransaction.create({
      safeId,
      userId,
      direction,
      type,
      comment,
      creationDate,
      amount,
    });
    return res.send({
      message: "تم اضافة المبلغ بنجاح",
      data: safeTransaction,
      data2: updatedSafe,
    });
  } catch (e) {
    return res.send({ error: e.toString() });
  }
};

// Accountant pay out money from safe.
exports.payOutMoneyFromSafe = async function (req, res) {
  try {
    const userId = req.user._id;
    
    const transAmount = req.body.amount;
    const type = req.body.type;
    if (!transAmount || !type) {
      res.send({
        error: "عفوا برجاء إدخال جميع المعلومات",
      });
    }
    const safeId = req.params.safeId;
    if (!objectId.isValid(safeId))
      return res.send({
        error: "safeId must be an ObjectId",
      });
  
  if (transAmount <= 0)
      return res.send({
        error: "عملية غير ناجحة :قيمة العملية يجب ان تكون اكثر من صفر",
      });

    var safe = await Safe.findById(safeId);
    if (!safe)
      return res.send({ error: "Couldn't find a safe with that Id" });
    else if (safe.deleted)
      return res.send({error:"Safe is temporarily deleted"});

    if (safe.amount < req.body.amount)
      return res.send({
        error: "عملية غير ناجحة :لا يوجد رصيد كافي في الخزنة",
      });
    safe.amount -= req.body.amount;
    req.body.safeId = req.params.safeId;
    req.body.direction = "out";
    req.body.creationDate = new Date();

    const newSafeBankTransaction = await SafeBankTransaction.create({
      ...req.body,
      userId,
    });
    const updatedSafe = await Safe.findByIdAndUpdate(safeId, safe, {
      new: true,
    });

    return res.send({
      data: newSafeBankTransaction,
      data2: updatedSafe,
      message: "تمت العملية بنجاح",
    });
  } catch (err) {
    return res.send({
      error: err.toString(),
    });
  }
};

// Accountant Delete an empty safe.
/* exports.deleteSafe = async (req, res) => {
  try {
    const userId = req.body.userId;
    const safeId = req.params.safeId;

    // ID checks
    if (!objectId.isValid(userId)) {
      return res.send({ error: "userId must be an objectId" });
    }

    if (!objectId.isValid(safeId)) {
      return res.send({ error: "safeId must be an objectId" });
    }

    // Get user
    const user = await User.findById(userId);

    // Check user type
    if (!user) return res.send({ error: "User not found" });
    else if (!(user.type == "accountant" || user.type == "financial director"))
      return res.send({ error: "You are unauthorized" });

    // Get Safe
    const safe = await Safe.findById(safeId);

    // Check if safe is valid
    if (!safe) return res.send({ error: "Safe does not exist" });

    // Get current amount in safe.
    const currentAmount = safe.amount;

    if (currentAmount > 0)
      return res.send({
        error: "Unable to delete safe as it is not empty",
      });

    const deletedSafe = await Safe.findByIdAndDelete(safeId);
    
    return res.send({
      message: "Safe deleted successfully",
      data: deletedSafe,
    });
  } catch (e) {
    return res.send({ error: e.toString() });
  }
};
 */

 exports.deleteSafe = async (req, res) => {
  try {
    const safeId = req.params.safeId;

    // ID checks
    if (!objectId.isValid(safeId)) {
      return res.send({ error: "safeId must be an objectId" });
    }

    // Get Safe
    const safe = await Safe.findById(safeId);

    // Check if safe is valid
    if (!safe) return res.send({ error: "Safe does not exist" });

    // Get current amount in safe.
    const currentAmount = safe.amount;

    if (currentAmount > 0)
      return res.send({
        error: "Unable to delete safe as it is not empty",
      });

    const deletedSafe = await Safe.findById(safeId);
    if(deletedSafe.deleted)
      return res.send({error:"The safe is already deleted"});
    
    deletedSafe.deleted =true;
    deletedSafe.save();
    
    return res.send({
      msg: "Safe deleted successfully",
      data: deletedSafe,
    });
  } catch (e) {
    return res.send({ error: e.toString() });
  }
};


//we need user authorization
exports.getAllSafes = async function (req, res) {
  const pageNo = parseInt(req.params.page);
  if(pageNo <= 0) return res.send({error:'page number must be greater than 0 '});
  const pageSize = parseInt(req.params.size);
  if(pageSize <= 0) return res.send({error:'page size must be greater than 0 '});
  let type = req.params.type
  let query = type === "all"? {deleted: {$ne: true}}:{type:type, deleted: {$ne: true}};
  const safe = await Safe.aggregate([
    {$match : query},
    // {$sort: {[sort]:order}},
    {$project: {password: 0}},
    {$facet:{
        safes: [{ $skip: (pageNo-1) * pageSize }, { $limit: pageSize}],
        totalCount: [{ $count: 'count' }]
      }}
    ]);
  return res.send({ data: safe[0] });
};

//we need user authorization
exports.getSafeTransactionHistory = async (req, res) => {
  try {
    const safeId = req.params.safeId;
    const startDateString = req.params.startDate;
    const endDateString = req.params.endDate;
    var startDate = new Date();
    var safeTransactions;
    const endDate = new Date(endDateString);
    endDate.setHours(23);
    endDate.setMinutes(59);
    endDate.setSeconds(59);
    if (!objectId.isValid(safeId))
      return res.send({ error: "safeId must be an objectId" });

    const requestedSafe = await Safe.findById(safeId);
    if (!requestedSafe)
      return res.send({ error: "Safe not found !" });

    else if (requestedSafe.deleted)
      return res.send({ error: "The requested safe is temporarily deleted" });



    if (startDateString !== 'all') {
      startDate = new Date(startDateString);
      startDate.setHours(00);
      startDate.setMinutes(00);
      startDate.setSeconds(00);
      if (startDate > endDate)
        return res.send({ error: "startDate cannot be greater than end date" });

      safeTransactions = await SafeBankTransaction.find({ safeId: safeId, creationDate: { $gte: startDate, $lte: endDate } });
    }
    else if (startDateString === 'all') {
      safeTransactions = await SafeBankTransaction.find({ safeId: safeId, creationDate: { $lte: endDate } });

    }

    if (!safeTransactions || safeTransactions.length === 0)
      return res.send({ error: "No transactions have been made on this safe in the specified period" });

    return res.send({ data: safeTransactions });


  }
  catch (err) {
    return res.send({ error: err.toString() });
  }
}



exports.createPdfSafe  = async(req,res) => {  
  const id = req.params.id;
  if(!id) return res.send({error:'there is no params in the request'});

  try{
      const safe = await SafeBankTransaction.findById(id).populate('safeId').populate('userId'); 
      if(!safe) return res.send({error:'there is no invoice with that id'});
      const docDef = safeTable(safe); 
      generatePdf(docDef,res);
  }catch(err){
      res.send({error:err.toString()});
  }
   
}   

exports.deleteTest = async (req,res) => {
  const id = req.params.id;
  if(!id) return res.send({error:'there is no params in the request'});

  try{
    const deletedSafe = await Safe.findByIdAndDelete(id);
    res.send({data : deletedSafe});

  }catch(err){
    res.send({error:err.toString()});
  }
}

exports.deleteSafeTransactionTest = async (req,res) => {

  const id = req.params.id;
  if(!id) return res.send({error:'there is no params in the request'});

  try{
    const deletedTransaction = await SafeBankTransaction.findByIdAndDelete(id);
    res.send({data : deletedTransaction});

  }catch(err){
    res.send({error:err.toString()});
  }

}
exports.EraseSafe = async (req, res) => {
  try {
    const safeId = req.params.safeId;
    // ID checks
    if (!objectId.isValid(safeId)) {
      return res.send({ error: "safeId must be an objectId" });
    }
    // Get Safe
    const safe = await Safe.findByIdAndDelete(safeId);
    return res.send({
      msg: "Safe deleted successfully",
      data: safe,
    });
  } catch (e) {
    return res.send({ error: e.toString() });
  }
};
