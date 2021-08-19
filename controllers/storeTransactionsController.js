const StoreTransaction = require('../models/StoreTransaction');
const { generatePdf } = require('../utils/generatePdf');
const { storeTable } = require('../utils/storeTable');

//Users Authorized to make a store transaction: StoreDirector
exports.addStoreTransaction = async function(transaction){

    transaction = {...transaction, creationDate: new Date()}
    const newTransaction = await StoreTransaction.create(transaction);
    return newTransaction;
} 


exports.createPdfStoreTransaction  = async(req,res) => {  
    const id = req.params.id;
    if(!id) return res.send({error:'there is no params in the request'});
  
    try{

        const transaction = await StoreTransaction.findById(id).populate('products.productId').populate('storeId').populate('subStoreId').populate('supplierId');

        if(!transaction) return res.send({error:'there is no store with that id'});
        const docDef = storeTable(transaction); 
        generatePdf(docDef,res);
    }catch(err){ 
        res.send({error:err.toString()});
    }
}    