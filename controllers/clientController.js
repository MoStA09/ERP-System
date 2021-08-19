const User = require('../models/User');
const Client = require('../models/Client');
const Invoice = require('../models/Invoice');
const objectId = require('mongoose').Types.ObjectId
const Product = require('../models/Product');
const { convertMapToObject } = require('../utils/convertMapToObject');

exports.addClient = async (req, res) => {
    try {
        
        const user = req.user;
        
        const clientName = req.body.name;
        req.body.products = [];
        req.body.subClients = [];
        req.body.deleted = false;
        if (!clientName) {
            return res.send({ error: "نقص فى بعض البيانات" });
        }
        else {
            const newClient = await Client.create(req.body);
            return res.send({ data: newClient, messege: "تم اضافه عميل بنجاح" });
        }

    } catch (err) {
        return res.send({ error: err.toString() });
    }


}

//Add sub client to a certain client in the system
exports.addSubClient = async function (req, res) {

    try{
        const user = req.user;

    const clientId = req.params.clientId;
    if (!objectId.isValid(clientId))
        return res.send({ error: 'clientId must be an ObjectId' });
    else if(!req.body.name)
        return res.send({ error: 'Name must be defined' });

            const foundClient = await Client.findOne({ _id: clientId })
            if (foundClient == null || foundClient.deleted)
                return res.send({ error: "هذا العميل غير موجود" })
            const subClientsNames = foundClient.subClients;
            for (var x in subClientsNames) {
                if (subClientsNames[x].name == req.body.name)
                    return res.send({ error: "هذا الاسم موجود بالفعل" })
            }
            const updatedClient = await Client.findOneAndUpdate(clientId, { $addToSet: { subClients: { name: req.body.name , deleted: false } } }, { new: true });
            updatedClient.subClients = updatedClient.subClients.filter(subClient => subClient.deleted == false);
            return res.send({ data: updatedClient });
      }catch(err) {
        return res.send({error: err.toString()});
    }
}; 

//we need user authorization
exports.getAllClientsInfo = async function(req, res) {
    try {
        let clients = await Client.find({deleted:false});
        for (let j = 0; j < clients.length; j++) {
            clients[j] = await getClientInfo(clients[j]);
        }
        return res.send({data: clients});
    } catch(err) {
        return res.send({error: err.toString()});
    }
}

//we need user authorization
exports.getAllClients = async function(req, res) {
    try {
        const pageNo = parseInt(req.params.page);
        if(pageNo <= 0) return res.send({error:'page number must be greater than 0 '});
        const pageSize = parseInt(req.params.size);
        if(pageSize <= 0) return res.send({error:'page size must be greater than 0 '});
        const clients = await Client.aggregate([
           {$match : {deleted:{$ne: true}}},
           {$facet:{
              clients: [{ $skip: (pageNo-1) * pageSize }, { $limit: pageSize}],
              totalCount: [{ $count: 'count' }]
            }}
          ]);
        return res.send({ data: clients[0] });
    } catch(err) {
        return res.send({error: err.toString()});
    }
}

//we need user authorization
exports.getClient = async function(req, res) {
    try {
        const clientId = req.params.clientId;
        if(!objectId.isValid(clientId)) {
            return res.send({error: "clientId must be an objectId"});
        }
        //Check if the client exists
        let client = await Client.findById(clientId);
        if(!client || client.deleted) {
            return res.send({error:"هذا العميل غير موجود"}) 
        }
        client = await getClientInfo(client);
        return res.send({data: client});
    } catch(err) {
        return res.send({error: err.toString()});
    }
}

getClientInfo = async function(client) {
    let clientId = client._id;
    let productsMap = new Map(); //to get all products bought and their quantities
    //Get all the invoices of type "invoice" for the client
    let invoiceTotal = 0;    
    const invoices = await Invoice.find({clientId: clientId, type: "invoice"});
    for (var i = 0; i < invoices.length; i++) {
        invoiceTotal += invoices[i].totalPrice;
        let products = invoices[i].products;
        for (let x = 0; x < products.length; x++) {
          let newQuantity = 0;
          newQuantity += products[x].quantity; //quantity in the invoice
          if (productsMap.has( String(products[x].productId) )) {
            newQuantity += productsMap.get(String(products[x].productId));
          }
          productsMap.set(String(products[x].productId), newQuantity);
        }
    }
    //Get all the invoices of type "returnInvoice" for the client
    let returnInvoiceTotal = 0;
    const returnInvoices = await Invoice.find({clientId: clientId, type: "returnInvoice"});
    for(var i = 0; i < returnInvoices.length; i++) {
        returnInvoiceTotal += returnInvoices[i].totalPrice;
        let products = returnInvoices[i].products;
        for (let x = 0; x < products.length; x++) {
            let newQuantity = 0;
            newQuantity -= products[x].quantity; //quantity in the return invoice
            if (productsMap.has( String(products[x].productId) )) {
              newQuantity += productsMap.get(String(products[x].productId));
            }
            productsMap.set(String(products[x].productId), newQuantity);
        }
    }
            
    //Get all the collection statements for the client
    let collectionStatmentTotal = 0;
    const collectionStatements = await CollectionStatement.find( {clientId: clientId, state: { $ne: "rejected" }} );
    for(var i = 0; i < collectionStatements.length; i++) {
        collectionStatmentTotal += collectionStatements[i].amount;
    }
    //Get all the cheques for the client
    let chequeTotal = 0;
    const cheques = await Cheque.find( {clientId: clientId, state: { $ne: "rejected" }} );
    for(var i = 0; i < cheques.length; i++) {
        chequeTotal += cheques[i].amount;
    }
    const productsObject = convertMapToObject(productsMap);
    //you can comment the previous line, remove the convertMapToObject function and uncomment the following line if you have Node v12
    //const productsObject = Object.fromEntries(productsMap);

    client.subClients = client.subClients.filter(subClient => subClient.deleted == false);

    client = JSON.parse(JSON.stringify(client));
    client.invoices = invoices;
    client.returnInvoices = returnInvoices;
    client.collectionStatements = collectionStatements;
    client.cheques = cheques;
    client.invoiceTotal = invoiceTotal;
    client.returnInvoiceTotal = returnInvoiceTotal;    
    client.dueAmount = invoiceTotal - (returnInvoiceTotal + collectionStatmentTotal + chequeTotal);
    client.productsWithQuantity = productsObject;
    return client;
}

exports.editSubClient = async function (req, res) {
    try{
        const clientId =  req.params.clientId;
        const itId = req.user._id;
        const IT = await User.findOne({_id:itId});
        if(!objectId.isValid(clientId)) return res.send({error: 'client Id is invalid'});
        let client = await Client.findOne({_id:clientId});
        if(!client || client.deleted) return res.send({error: 'error 404 client does not exist'});
        let subClientId = req.body.id;
        let subClientName = req.body.name;
        if(!objectId.isValid(subClientId)) return res.send({error: 'client Id is invalid'});
        if(!subClientName || typeof subClientName !== 'string' || subClientName === "") return res.send({error: "must insert subClient name"})

        if(client.subClients.length > 0 ){
            for(var i = 0; i < client.subClients.length; i++){
                let subId = client.subClients[i]._id;
                if(subId.equals(subClientId)){
                    if(client.subClients[i].deleted) 
                        return res.send({error: 'Subclient not found'});
                    else 
                        client.subClients[i].name = subClientName;
                }
            };
        }
        let subClients = client.subClients
        client = await Client.findOneAndUpdate({_id:clientId},{ $set: {subClients: subClients}},{new:true})
        client.subClients = client.subClients.filter(subClient => subClient.deleted == false);
        return res.send({data:client});
    }catch(error){
        return res.send({ error: error.toString() });
    }
};
exports.editClient = async function (req, res) {
    try{
        const clientId =  req.params.clientId
        if(!objectId.isValid(clientId)) return res.send({error: 'client Id is invalid'});
        let client = await Client.findOne({_id:clientId});
        if(!client || client.deleted) return res.send({error: 'error 404 client does not exist'});

        let name = req.body.name;
        let newProducts = req.body.newProducts;
        if(!name || typeof name !== 'string' || name === "") name = client.name;
        if(!newProducts) return res.send({error: 'newProducts Array does not exist'})

        if(newProducts.length > 0){
        //by converting the array to set we eliminate the duplicated values.
            let set = new Set(newProducts);
            newProducts = Array.from(set)

        // checking the validity of the values using mongoObjectId
            for(var i = 0; i < newProducts.length;i++){
                let productId = newProducts[i].productId;
                if(!objectId.isValid(productId)) return res.send({error: 'the product Id of one of the elements you are trying to add is invalid'})
                let product = await Product.findOne({_id:productId});
                if(!product) return res.send({error: 'product does not exist'})
            }
        }   
        let products = newProducts;
        client = await Client.findOneAndUpdate({_id:clientId},{ $set: {products: products, name: name }} ,{new:true})
        client.subClients = client.subClients.filter(subClient => subClient.deleted == false);
        return res.send({data:client, msg: 'client has been updated successfully',});
    }catch(error){
        return res.send({ error: error.toString() });
    }
};

exports.deleteClient = async function (req, res) {
    try{
        let clientId = req.params.clientId;
        
        if(!objectId.isValid(clientId)) 
            return res.send({error: 'clientId is invalid'});

        const deletedClient = await Client.findOneAndUpdate(
            { _id: clientId},
            { deleted: true},
            { new: true }
        )
        if(!deletedClient)  
            return res.send({ error: 'Client not found' });
        else 
            return res.send({data:deletedClient})
    }catch(error){
        return res.send({ error: error.toString() });
    }
}

exports.deleteSubClient = async function (req, res) {
    try{
        let clientId = req.params.clientId;

        let subClientId = req.body.subClientId;
        
        if(!objectId.isValid(clientId)) 
            return res.send({error: 'clientId is invalid'});

        if(!objectId.isValid(subClientId)) 
            return res.send({error: 'subClientId is invalid'});
            
        const foundClient = await Client.findById(clientId);

        if(!foundClient || foundClient.deleted)
            return res.send({ error: 'Client not found' });

        let subClientsArray = foundClient.subClients;

        for(var i = 0; i < subClientsArray.length; i++){
            if(subClientsArray[i]._id == subClientId){
                subClientsArray[i].deleted = true;
                break;
            }
        }

        const newClient = await Client.findOneAndUpdate(
            { _id: clientId},
            { subClients: subClientsArray},
            { new: true }
        )
        return res.send({data:newClient})
    }catch(error){
        return res.send({ error: error.toString() });
    }
}

exports.deleteTest = async function (req, res) {
    try{
        const deletedClient = await Client.findByIdAndDelete(req.params.clientId);
        res.send({ data:deletedClient });
    }catch(error){
        return res.send({ error: error.toString() });
    } 
}