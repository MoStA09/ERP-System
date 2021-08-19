const CollectionStatement = require('../models/CollectionStatement');
const Client = require('../models/Client');
const Cheque = require('../models/Cheque');
const User = require('../models/User');
const Safe = require('../models/Safe');
const objectId = require('mongoose').Types.ObjectId;
const safeController = require('./safeController');
const { generatePdf } = require('../utils/generatePdf');
const { collectionTable } = require('../utils/collectionTable');


exports.createCollectionStatement = async function (req, res) {
  const clientId = req.params.clientId;
  const {amount} = req.body;
  let comment = req.body.comment;
  const userId = req.user._id;

  if (!clientId) return res.send({ error: 'Missing parameter clientId' });
  if (!objectId.isValid(clientId)) return res.send({ error: 'Invalid clientId type' });

  if (!amount && amount!=0) return res.send({ error: 'Missing parameter amount' });
  if (amount<0) return res.send({ error: 'amount can not be less than 0' });

  try {
    
    const client = await Client.findOne({ _id: clientId });
    if (!client || client.deleted)
    return res.send({ error: 'client not found' });

    if (!comment || comment === '') comment = '';
    else comment = ': '+comment;

    const newCollectionStatement = await CollectionStatement.create({
        clientId,
        userId,
        amount,
        state:'on hold',
        creationDate: new Date(),
        history:[{date:new Date(), comment:'Creation'+comment}]
    });

    return res.send({
      data: newCollectionStatement,
      msg: 'Collection statement created successfully',
    });
  } catch (error) {
    return res.send({ error: error.toString() });
  }
};

exports.editCollectionStatement = async function (req, res) {
  const collectionStatementId = req.params.collectionStatementId;
  const { amount } = req.body;
  let comment = req.body.comment;
  const userId = req.user._id;


  if(!collectionStatementId) return res.send({ error: 'Missing parameter collectionStatementId' });
  if(!objectId.isValid(collectionStatementId)) return res.send({ error: 'Invalid type collectionStatementId' });

  if(!amount && amount!=0) return res.send({ error: 'Missing parameter amount' });
  if(amount<0) return res.send({ error: 'amount can not be less than 0' });
  
  try {
    
    const collectionStatement = await CollectionStatement.findOne({ _id: collectionStatementId });
    if (!collectionStatement) return res.send({ error: 'Collection Statement not found' });
    if (!collectionStatement.userId.equals(userId)) return res.send({ error: 'Can not edit collection statement that does not belong to user' });
    if (collectionStatement.state!='on hold') return res.send({ error: 'Can not edit collection statement that is accepted or rejected' });
    
    if(!comment || comment==='') comment='';
    else comment=', '+comment;
    let history = collectionStatement.history;
    history.push({date:new Date(), comment:'Changed amount from '+collectionStatement.amount+' to '+amount+comment});
    const updatedCollectionStatement = await CollectionStatement.findOneAndUpdate({_id:collectionStatementId},{ $set: {amount,history}},{new:true})
    return res.send({data:updatedCollectionStatement, msg: 'Collection statement has been updated successfully',});
  
  }
  catch (error) {
    return res.send({ error: error.toString() });
  }
};

exports.approveCollectionStatement = async function(req, res){
  await approveOrDisapprove(req, res, 'accepted')
}

exports.disapproveCollectionStatement = async function(req, res){
  await approveOrDisapprove(req, res, 'rejected')
}
approveOrDisapprove = async function (req, res, state) {

  const collectionStatementId = req.params.collectionStatementId;
  const comment = req.body.comment;

  if (!collectionStatementId) return res.send({ error: 'Missing some requirments' });

  if (!objectId.isValid(collectionStatementId)) return res.send({ error: 'Collection Statement ID is not a valid ObjectId' });

  try {
    let collectionStatement = await CollectionStatement.findOne({ _id: collectionStatementId, state: 'on hold'});
    let user = req.user;

    if (!collectionStatement) return res.send({ error: 'Collection Statement not found!' });

    if (state === 'accepted') {
      req.body.type = 'cash';
      req.body.amount = collectionStatement.amount;
      await safeController.addMoneyToSafe(req, res);
    }

    collectionStatement.state = state;
    collectionStatement.history.push({ date: new Date(), comment: comment + `\n User ${user.username} has ${state} the collection statement` })
    const updatedCollectionStatement = await collectionStatement.save();

    if(state === 'rejected') 
      return res.send({ data: updatedCollectionStatement });

  } catch (error) {
    return res.send({ error: error.toString() });
  }

}
exports.getSpecificCollectionStatements = async function (req, res) {

  try {
    const collectorId = req.params.collectorId;
    const startDateString = req.params.startDate;
    const endDateString = req.params.endDate;
    let userQuery={};
    var startDate = new Date();
    // Validate objectID
    if (!objectId.isValid(collectorId)&& collectorId !== 'all')
      return res.send({
        error: "collectorId must be an objectId"
      });
    // Validate collector
    if(collectorId!=='all'){
      const collectorInQuestion = await User.findById(collectorId);
      if (!collectorInQuestion)
        return res.send({ error: "Collector not found" });
      else if (collectorInQuestion.type !== "collector")
        return res.send({ error: "Please enter a valid Collector ID" });
        userQuery= {userId:collectorId};

    }
    //Date Format: yyyy-mm-dd (08-27-2020)  
    //setting endDate time to 11:59 pm to include all invoices on that day.
    const endDate = new Date(endDateString);
    endDate.setHours(23);
    endDate.setMinutes(59);
    endDate.setSeconds(59);
    let collectionStatements = {};
    if (startDateString === 'all')
      collectionStatements = await CollectionStatement.find({$and:[ userQuery, {creationDate: { $lte: endDate } }]});
    else {
      //setting start Date time to 12 am to include all invoices on that day.
      startDate = new Date(startDateString);
      startDate.setHours(00);
      startDate.setMinutes(00);
      startDate.setSeconds(00);
      if (startDate > endDate)
        return res.send({ error: "startDate cannot be greater than endDate" });
      collectionStatements = await CollectionStatement.find({$and:[ userQuery, {creationDate: { $lte: endDate ,$gte:startDate} }]});
    }
    if (!collectionStatements || collectionStatements.length === 0)
     return res.send({ error: "The requested collector has not made any collection statement in the specified period" });

    return res.send({
      msg: "Here are the collection statements for the requested collector",
      data: collectionStatements
    })

  } catch (err) {
    return res.send({ error: err.toString() });
  }

}




exports.ceratePdfCollection = async(req,res)=>{
  const id = req.params.id ; 
  if(!id)return res.send({error:'there is no params in the request'});
 
  try{
    const collection = await CollectionStatement.findById(id).populate('clientId').populate('userId');

    if(!collection) return res.send({error:'there is no collecion with that id'});
    const docDef = collectionTable(collection);
    generatePdf(docDef,res);
  }catch(err){
    res.send({error:err.toString()});
  }

}

exports.deleteCollectionStatement = async function (req, res) { 
  if (!objectId.isValid(req.params.collectionStatementId)) {
    return res.send({ error: "expenseId must be an ObjectId" });
  }
  try {
   const collectionStatement = await CollectionStatement.findByIdAndDelete(req.params.collectionStatementId);
    return res.send({ data: collectionStatement });
  } catch (err) {
    return res.send({ error: err.toString() });
  }
};

exports.getStatement = async function (req, res) { 
  if (!objectId.isValid(req.params.collectionStatementId)) {
    return res.send({ error: "expenseId must be an ObjectId" });
  }
  try {
   const collectionStatement = await CollectionStatement.findById(req.params.collectionStatementId);
    return res.send({ data: collectionStatement });
  } catch (err) {
    return res.send({ error: err.toString() });
  }
};