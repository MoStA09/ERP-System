const User = require("../models/User");
const Cheque = require("../models/Cheque");
const Client = require("../models/Client");
const { chequeTable } = require("../utils/chequeTable");
const { generatePdf } = require("../utils/generatePdf");
const objectId = require("mongoose").Types.ObjectId;
const safeController = require('./safeController');

exports.createCheque = async (req, res) => {
    try {

        //intializing vars
        const user = req.user;
        const userId = user._id;
        const amount = req.body.amount;
        const comment = req.body.comment;
        let collectionDate = req.body.collectionDate;
        const clientId = req.params.clientId;
        
        if (!collectionDate)
            return res.send({ error: "Missing some requirments!" });  
        else if (!amount || amount <= 0 )
            return res.send({error: "amount must be greater than zero"})
        
        //checking all IDs are objectId
        else if (!objectId.isValid(clientId))
            return res.send({
                error: "clientId must be an ObjectId"
            });

        //check if the client exists
        const client = await Client.findById(clientId);
        if (!client || client.deleted) return res.send({ error: "Client was not found" });
        
        //setting creationDate, history
        const creationDate = new Date();
        collectionDate = new Date(collectionDate);
        if(collectionDate.getTime() < creationDate.getTime())
            return res.send({error: 'Collection Date must be after the creation Date '})
        const history = [{ date: new Date(), comment: comment ? `Creation: ${comment}`: 'Creation'}]


        //creating cheque
        const cheque = await Cheque.create({ 
                userId,
                clientId,
                history, 
                amount, 
                state: 'on hold', 
                creationDate, 
                collectionDate });
       
        return res.send({ data: cheque });
    } catch (e) {
        return res.send({ error: e.message });
    }
};


  
exports.createChequePdf  = async(req,res) => {  
    const id = req.params.id;
    if(!id) return res.send({error:'there is no params in the request'});

    try{
        const cheque = await Cheque.findById(id).populate('clientId').populate('userId').populate('safeId');  
        if(!cheque) return res.send({error:'there is no cheque with that id'});
        const docDef = chequeTable(cheque);
        generatePdf(docDef,res);
    }catch(err){
        res.send({error:err.toString()});
    }
     
}   

exports.approveChequeToSafe = async function(req, res){
    await approveOrDisapproveCheque(req, res, 'in safe')
}

exports.approveChequeToBank = async function(req, res){
    await approveOrDisapproveCheque(req, res, 'in bank')
}

exports.disapproveCheque = async function(req, res){
    await approveOrDisapproveCheque(req, res, 'rejected');
}

approveOrDisapproveCheque = async function (req, res, location) {

    const chequeId = req.params.chequeId;
    const user = req.user;
    const comment = req.body.comment;

    if (!chequeId) return res.send({ error: 'Missing some requirments' });

    if (!objectId.isValid(chequeId)) return res.send({ error: 'Cheque ID is not a valid ObjectId' });

    try {
        let cheque = await Cheque.findOne({ _id: chequeId, state: 'on hold' });

        if (!cheque) return res.send({ error: 'Cheque not found!' });

        if (location !== 'rejected') {
            req.body.amount = cheque.amount;
            req.body.type = 'cheque';
            await safeController.addMoneyToSafe(req, res);
        }

        cheque.state = location;
        cheque.history.push({ date: new Date(), comment: comment + `\n User ${user.username} has ${(location === 'rejected')? 'rejected' : 'approved'} the Cheque` });
        const updatedCheque = await cheque.save();

        if(location === 'rejected')
            return res.send({ data: updatedCheque, msg: 'Cheque has been rejected' });

    } catch (error) {
        return res.send({ error: error.toString() });
    }

}

exports.deleteTest = async function (req, res) {
    try{
        const deletedCheque = await Cheque.findByIdAndDelete(req.params.chequeId);
        res.send({ data:deletedCheque });
    }catch(error){
        return res.send({ error: error.toString() });
    } 
}

exports.getCheque = async function (req, res) {
    try{
        const chequeId = req.params.chequeId;
        if (!objectId.isValid(chequeId))
            return res.send({ error: "chequeId must be an ObjectId" });
            
        const foundCheque = await Cheque.findById(req.params.chequeId);
        res.send({ data:foundCheque });
    }catch(error){
        return res.send({ error: error.toString() });
    } 
}
