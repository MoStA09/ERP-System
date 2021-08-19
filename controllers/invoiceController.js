const User = require('../models/User');
const Client = require('../models/Client');
const Product = require('../models/Product');
const Invoice = require('../models/Invoice');
const { generatePdf } = require('../utils/generatePdf');
const Supplier = require('../models/Supplier');
const { invoiceTable } = require('../utils/invoiceTable');
const objectId = require('mongoose').Types.ObjectId;

  
exports.createInvoice = async (req, res) => {
    try {
        //intializing vars
        const userId = req.user._id;
        const type = req.body.type;
        const products = req.body.products;
        const clientId = req.params.clientId;
        const subClientName = req.params.subClientName;
        let comment = req.body.comment;

        if(!type || !products || products.length === 0)
            return res.send({ error: "Missing some requirments!" });

        //checking all IDs are objectId
        if (!objectId.isValid(clientId))
            return res.send({
                error: "clientId must be an ObjectId"
            });
        else
            for(const product of products) {
                if (!objectId.isValid(product.productId))
                    return res.send({
                        error: "All productIds must be an ObjectId"
                    });
                else if(!product.quantity || product.quantity <= 0) 
                    return res.send({ error: `quantity must be more than zero` });
            }

        //check if the client exists
        const client = await Client.findById(clientId);

        if (!client || client.deleted) 
            return res.send({ error: "Client was not found" });

        //check if the subClient belongs to this client
        const foundedSubClient = client.subClients.find(subClient => subClient.name === subClientName);

        if (!foundedSubClient || foundedSubClient.deleted) 
            return res.send({ error: "subClient was not found" });
        
        //Check for comment
        if (!comment || comment === '') comment = '';
        else comment = ': '+comment;    
        
        //setting creationDate, products, and calculating totalPrice
        let totalPrice = 0;
        let creationDate = new Date();
        let productsArr = [];
        
        for(const product of products) {
            const foundedProduct = await Product.findById(product.productId);
            if(!foundedProduct)
                return res.send({ error: `product (${product.name}) was not found` });
            //find if a discount applies to that product, get total discount percentage
            const discountsFound = await Discount.aggregate([
                //find products that match with all these info
                { $match: {
                    $and: [
                        { productId : foundedProduct._id },
                        { clientId : client._id },
                        { startDate : { $lte : creationDate } },
                        { endDate : { $gte : creationDate } }
                    ]
                }} ,
                { $facet: {
                    ids: [{$project: { _id : 1}}], //return only discount ids
                    totalPercentage: [ { $group: { _id : "$productId", percentage : { $sum: "$percentage" } } }]
                  }} 
                ]);
            let productInfo = { 
                productId: foundedProduct._id,
                quantity: product.quantity,
                unitPrice: foundedProduct.price,
                tax: foundedProduct.tax
            }
            let discountAmount = 0;
            if ( discountsFound[0].ids.length > 0) {
                productInfo.discountPercentage = discountsFound[0].totalPercentage[0].percentage;
                productInfo.discounts = discountsFound[0].ids;
                discountAmount = ((discountsFound[0].totalPercentage[0].percentage / 100) * foundedProduct.price);
            }
            productsArr.push(productInfo);
            totalPrice += (foundedProduct.price + foundedProduct.tax - discountAmount) * product.quantity;
        }
        //Create history
        const history=[{date:new Date(), comment:'Creation'+comment}]

        //intializing invoiceNumber
        const foundedInvoices = await Invoice.find({});
        let invoiceNumber = foundedInvoices.length + 1;
        //creating invoice   
        const invoice = await Invoice.create({invoiceNumber, type, clientId, userId, totalPrice, creationDate, history, products: productsArr});
        return res.send({ data: invoice });

    } catch (err) {
        return res.send({ error: err.message });
    }
}
exports.editInvoice = async function(req,res){
    try{
        //Check if invoiceId is valid
        const invoiceId = req.params.invoiceId;
        if (!objectId.isValid(invoiceId))
            return res.send({
                error: "invoiceId must be an objectId"
            });
        //Check for the requirements     
        const products = req.body.products;
        let comment = '';
        let userComment = req.body.comment;
        if(!products || products.length == 0)
            return res.send({error : "نقص فى بعض البيانات"});
        //Check for comment
        if (!userComment || userComment === '') userComment = '';
        else userComment = ' '+userComment;    
        
        const tempProducts = [];
        var totalPrice = 0;   
        for(var i=0; i<products.length;i++){
            //Check if productId[i] is valid
            if (!objectId.isValid(products[i].productId))
            return res.send({
                error: "productId must be an objectId"
            });
            //Check the quantity for products[i] is positive
            if(products[i].quantity <= 0)
                return res.send({error:`${i+1} الكميه يجب ان تكون اكبر من صفر للمنتج رقم`});
            //Check if the product exists in the database
            const product = await Product.findById(products[i].productId)
            if(!product)
                return res.send({
                    error: "السلعه غير موجوده فى قاعده البيانات"
                })
            //Create th updated informations for the invoice    
            else{
                tempProducts.push({
                    productId: products[i].productId,
                    quantity: products[i].quantity,
                    unitPrice: product.price,
                    tax: product.tax
                }) 
                totalPrice += (product.tax + product.price) * (products[i].quantity) 
            }       
        }//End of for loop
        //Comments of what changed in the invoice
        let flag = false;
        const invoice = await Invoice.findById(invoiceId);
        for(var i = 0;i<tempProducts.length;i++){
            flag = false;
            for(var j = 0;j<invoice.products.length;j++){
                if(tempProducts[i].productId == invoice.products[j].productId){
                    if(tempProducts[i].quantity != invoice.products[j].quantity){
                        const tempProduct = await Product.findById(invoice.products[j].productId)
                        comment = comment +" "+ `${tempProduct.name} the quantity of it changed from ${invoice.products[j].quantity} to ${tempProducts[i].quantity}`+","
                    }
                    flag = true;
                }
            }
            if(!flag){
                const tempProduct1 = await Product.findById(tempProducts[i].productId)
                comment = comment +" "+`${tempProduct1.name} was added new with quantity ${tempProducts[i].quantity}`+","
            }
        }
        //Check if a product was deleted
        let flag1 = false;
        for(var i = 0;i<invoice.products.length;i++){
            flag1 = false;
            for(var j = 0;j<tempProducts.length;j++){
                if(invoice.products[i].productId == tempProducts[j].productId){
                    flag1 = true;
                } 
            }
            if(!flag1){
                const tempProduct2 = await Product.findById(invoice.products[i].productId)
                comment = comment +"  "+ `${tempProduct2.name} was deleted from the invoice`+","
            }
        }
        

        //Update the invoice
        const history={date:new Date(), comment:comment+userComment}
        const updatedInvoice = await Invoice.findByIdAndUpdate(
            {_id:invoiceId}, 
            {
                $set:{products:tempProducts,totalPrice:totalPrice},
                $push:{history:history}
            },
            {new:true})
            return res.send({data:updatedInvoice});


    }catch(err){
        return res.send({error:err.toString()});

    }
}

exports.getTeamSalesAndReturnInvoices = async (req, res) => {
    try {
        const startDateString = req.params.startDate;
        const endDateString = req.params.endDate;
        const endDate = new Date(endDateString);
        var startDate = new Date();

        if (startDateString !== 'all') {
            startDate = new Date(startDateString);
            startDate.setHours(00);
            startDate.setMinutes(00);
            startDate.setSeconds(00);
        }
        endDate.setHours(23);
        endDate.setMinutes(59);
        endDate.setSeconds(59);
        if (startDate > endDate && startDateString !== 'all')
            return res.send({ error: "startDate cannot be greater than end date" });

        const user = req.user;

        //we need user authorization here 
        const teamMembers = user.teamMembers;
        var teamSales = [];
        var teamReturnInvoices = [];

        for (var i = 0; i < teamMembers.length; i++) {
            var teamMemberSales = await getInvoices(startDate, startDateString, endDate, teamMembers[i]);
            var teamMemberReturnInvoices = await getReturnInvoices(startDate, startDateString, endDate, teamMembers[i]);
            teamSales = teamSales.concat(teamMemberSales);
            teamReturnInvoices = teamReturnInvoices.concat(teamMemberReturnInvoices);
        }


        return res.send({ data: teamSales, data2: teamReturnInvoices });
    }
    catch (err) {
        res.send({ error: err.toString() });
    }
}

// User story 4.1.3 - Sales supervisor: See specific salesman sales and return invoices.
//User 3.1.4 - Salesman .
// Needs user authorization.
exports.getSpecificInvoices = async function (req, res) {
    try {
        const salesmanId = req.user._id;
        const startDateString = req.params.startDate;
        const endDateString = req.params.endDate;
        var startDate = new Date();


        //Date Format: yyy-mm-dd (08-27-2020)  
        //setting endDate time to 11:59 pm to include all invoices on that day.
        const endDate = new Date(endDateString);
        endDate.setHours(23);
        endDate.setMinutes(59);
        endDate.setSeconds(59);
        let sales = {};
        let returnInvoices = {};
        //setting start Date time to 12 am to include all invoices on that day.
        startDate = new Date(startDateString);
        startDate.setHours(00);
        startDate.setMinutes(00);
        startDate.setSeconds(00);

        // Retrieve sales
        sales = await getInvoices(startDate, startDateString, endDate, salesmanId);
        // Retrieve return invoices
        returnInvoices = await getReturnInvoices(startDate, startDateString, endDate, salesmanId);

        if (!sales && !returnInvoics)
            res.send({ error: "The requested salesman has not made any sales or return invoices in the specified period" });

        return res.send({
            msg: "Here are the sales and return invoices for the requested salesman",
            data: sales,
            data2: returnInvoices
        })

    } catch (err) {
        return res.send({ error: err.toString() });
    }

}
exports.scheduleFutureInvoice = async (req, res) => {
    try{
        const userId = req.user._id;

        const type = "future";
        const products = req.body.products;
        const creationDate = new Date(req.body.creationDate);

        const clientId = req.params.clientId;
        const subClientName = req.params.subClientName;

        let comment = req.body.comment;

        if (!objectId.isValid(clientId))
            return res.send({error: "clientId must be an objectId"});
        
        if(!products || products.length === 0 || !creationDate)
            return res.send({ error: "Missing some requirments!" });

        for(var i=0; i<products.length;i++) {
            if (!objectId.isValid(products[i].productId))
                return res.send({error: "All productIds must be an ObjectId"});
            else if(!products[i].quantity || products[i].quantity <= 0) 
                return res.send({ error: `quantity must be more than zero` });
        }

        const client = await Client.findById(clientId);
        if (!client || client.deleted) 
            return res.send({ error: "Client was not found" });
    
        const foundedSubClient = client.subClients.find(subClient => subClient.name === subClientName);
        if (!foundedSubClient || foundedSubClient.deleted) 
            return res.send({ error: "subClient was not found" });

        const currentDate = new Date();
        if(creationDate<currentDate)
            return res.send({ error: "Invalid date" });

        if (!comment || comment === '') comment = '';
        else comment = ': '+comment;    
        const history=[{date:new Date(), comment:'Creation'+comment}]
        
        let totalPrice = 0;
        let productsArr = [];
    
        for(var i=0; i<products.length;i++) {
            const foundedProduct = await Product.findById(products[i].productId);
            if(!foundedProduct)
                return res.send({ error: `product (${products[i].name}) was not found` });
                
            productsArr.push({
            productId: foundedProduct._id,
            quantity: products[i].quantity,
            unitPrice: foundedProduct.price,
            tax: foundedProduct.tax
            });
            totalPrice += (foundedProduct.price + foundedProduct.tax) * products[i].quantity;
        }
    
        const foundedInvoices = await Invoice.find({});
        let invoiceNumber = foundedInvoices.length + 1;

        const invoice = await Invoice.create({invoiceNumber, type, clientId, userId, totalPrice, creationDate, history, products: productsArr});
        return res.send({ data: invoice });
     
    } catch (err) {
        return res.send({ error:err.toString() });
    }


}

exports.scheduleInvoiceToSalesman = async (req, res) => {
    try{
        const userId = req.body.userId;

        const type = "future";
        const products = req.body.products;
        const creationDate = new Date(req.body.creationDate);

        const clientId = req.params.clientId;
        const subClientName = req.params.subClientName;

        let comment = req.body.comment;

        if (!objectId.isValid(clientId))
            return res.send({error: "clientId must be an objectId"});

        if (!objectId.isValid(userId))
            return res.send({error: "userId must be an ObjectId"});
        
        if(!userId || !products || products.length === 0 || !creationDate)
            return res.send({ error: "Missing some requirments!" });

        for(var i=0; i<products.length;i++) {
            if (!objectId.isValid(products[i].productId))
                return res.send({error: "All productIds must be an ObjectId"});
            else if(!products[i].quantity || products[i].quantity <= 0) 
                return res.send({ error: `quantity must be more than zero` });
        }

        const user = await User.findById(userId);
        if (!user) 
            return res.send({ error: "User was not found" });
        if (user.type !== "salesman")
            return res.send({ error: "user chosen is not a salesman" });

        const client = await Client.findById(clientId);
        if (!client || client.deleted) 
            return res.send({ error: "Client was not found" });
    
        const foundedSubClient = client.subClients.find(subClient => subClient.name === subClientName);
        if (!foundedSubClient || foundedSubClient.deleted) 
            return res.send({ error: "subClient was not found" });

        const currentDate = new Date();
        if(creationDate<currentDate)
            return res.send({ error: "Invalid date" });

        if (!comment || comment === '') comment = '';
        else comment = ': '+comment;    
        const history=[{date:new Date(), comment:'Creation'+comment}]
        
        let totalPrice = 0;
        let productsArr = [];
    
        for(var i=0; i<products.length;i++) {
            const foundedProduct = await Product.findById(products[i].productId);
            if(!foundedProduct)
                return res.send({ error: `product (${products[i].name}) was not found` });
                
            productsArr.push({
            productId: foundedProduct._id,
            quantity: products[i].quantity,
            unitPrice: foundedProduct.price,
            tax: foundedProduct.tax
            });
            totalPrice += (foundedProduct.price + foundedProduct.tax) * products[i].quantity;
        }
    
        const foundedInvoices = await Invoice.find({});
        let invoiceNumber = foundedInvoices.length + 1;

        const invoice = await Invoice.create({invoiceNumber, type, clientId, userId, totalPrice, creationDate, history, products: productsArr});
        return res.send({ data: invoice });
    
    } catch (err) {
        return res.send({ error:err.toString() });
    }


}

exports.editFutureInvoice = async (req,res)=>{
    try{
        const invoiceId = req.params.invoiceId;
        const newType = req.body.type;
        let comment = '';
        let userComment = req.body.comment;
        //Check if invoiceId is valid
        if (!objectId.isValid(invoiceId))
            return res.send({
                error: "invoiceId must be an objectId"
            });
        //Check for the requirements
        if(!newType)
            return res.send({error : "نقص فى بعض البيانات"});
              
        //Check for comment
        if (!userComment || userComment === '') userComment = '';
        else userComment = ' '+userComment; 
        //Check for the newType
        if(!(newType === "invoice" || newType === "returnInvoice"))
            return res.send({error:"new type should be invoice or returnInvoice"})  
        //Check for the invoice 
        const invoice = await Invoice.findById(invoiceId);
        if(!invoice)
            return res.send({error:"No invoice with this id"})  
        //Check for the type of the invoice to be future  
        if(!(invoice.type == "future"))
            return res.send({error:"The type of invoice is not future"}) 
        //Check for the date
        const nowDate = new Date();
        if(invoice.creationDate.getTime() > nowDate.getTime()) 
            return res.send({error:"ميعاد هذه الفاتوره ما زال فى المستقبل"}) 
        //Update the invoice 
        comment = comment +"  "+ `This invoice changed from type future to type ${newType}`+","
        const history={date:new Date(), comment:comment+userComment}
        const updatedInvoice = await Invoice.findByIdAndUpdate(
            {_id:invoiceId}, 
            {
                $set:{type:newType},
                $push:{history:history}
            },
            {new:true})
            return res.send({data:updatedInvoice});               

    }catch(err){
        return res.send({error:err.toString()});
    }

}

getInvoices = async (startDate, startDateString, endDate, salesmanId) => {

    if (startDateString === 'all')
        return await Invoice.find({
            creationDate: { $lte: endDate }, userId: salesmanId, type: "invoice"
        });
    else
        return await Invoice.find({
            creationDate: { $gte: startDate, $lte: endDate },
            userId: salesmanId, type: "invoice"
        });
}

getReturnInvoices = async (startDate, startDateString, endDate, salesmanId) => {

    if (startDateString === 'all')
        return await Invoice.find({
            creationDate: { $lte: endDate }, userId: salesmanId, type: "returnInvoice"
        });
    else
        return await Invoice.find({
            creationDate: { $gte: startDate, $lte: endDate },
            userId: salesmanId, type: "returnInvoice"
        });
}



exports.createPdfInvoice  = async(req,res) => {  
    const invoiceNumber = req.params.id;
    if(!invoiceNumber) return res.send({error:'there is no params in the request'});

    try{
        const invoice = await Invoice.findOne({invoiceNumber}).populate('clientId').populate('userId').populate('products.productId');  
        if(!invoice) return res.send({error:'there is no invoice with that id'});
        const docDef = invoiceTable(invoice);
        generatePdf(docDef,res);
    }catch(err){
        res.send({error:err.toString()});
    }
     
}   

exports.createEmptyInvoice = async (req, res) => {
    await chargeOrDischarge(req, res, "emptyCharge");
}
exports.createEmptyReturnInvoice = async (req, res) => {
    await chargeOrDischarge(req, res, "emptyDischarge");
}

chargeOrDischarge = async function (req, res, invoiceType) {
    try {
        //intializing vars
        const userId = req.user._id;
        const type = invoiceType;
        const clientId = req.params.clientId;
        let creationDate = new Date();
        let totalPrice = req.body.totalPrice;
        let comment = req.body.comment;
        if(!totalPrice)
            return res.send({ error: "Missing some requirments!" });

        //checking all IDs are objectId
        if (!objectId.isValid(clientId))
            return res.send({error: "clientId must be an ObjectId"});
        

        //checking Authorization
        const user = req.user;
        
        if (user.type == "financial director"){
            //check if the client or supplier exists
            const client = await Client.findById(clientId);
            
            if (!client){ 
                const supplier = await Supplier.findById(clientId);
                if(!supplier)
                    return res.send({ error: "No Client or Supplier with this id" });
            }    
            else{
                if (client.deleted) 
                    return res.send({ error: "Client was deleted" });
            }
        }
        else{
            if(user.type == "accounting supervisor"){
                //check if the client exists
                const client = await Client.findById(clientId);
                if(!client || client.deleted) return res.send({ error: "Client was not found" });
            }
        }      
        
        //Check for comment
        if (!comment || comment === '') comment = '';
        else comment = ': '+comment;    

        //Create history
        const history=[{date:new Date(), comment:'Creation'+comment}]

        //intializing invoiceNumber
        const foundedInvoices = await Invoice.find({});
        let invoiceNumber = foundedInvoices.length + 1;
        //creating invoice   
        const invoice = await Invoice.create({invoiceNumber, type, clientId, userId, totalPrice, creationDate, history});
        return res.send({ data: invoice });

    } catch (err) {
        return res.send({ error: err.message });
    }
}

exports.getInvoices = async (req, res) => {
    try {

        //Date Format: MM/DD/YYYY
        const startDateString = req.params.startDate;
        const endDateString = req.params.endDate;
        const type = req.params.type;
        const endDate = new Date(endDateString);
        var startDate = new Date();

        if (startDateString !== 'all') {
            startDate = new Date(startDateString);
            startDate.setHours(00);
            startDate.setMinutes(00);
            startDate.setSeconds(00);
        }
        endDate.setHours(23);
        endDate.setMinutes(59);
        endDate.setSeconds(59);
        if (startDate > endDate && startDateString !== 'all')
            return res.send({ error: "startDate cannot be greater than end date" });


        // User Authentication for "financial director" , "accounting supervisor" , "general manager"

        
        const pageNo = parseInt(req.params.page);
        if(pageNo <= 0) return res.send({error:'page number must be greater than 0 '});
        const pageSize = parseInt(req.params.size);
        if(pageSize <= 0) return res.send({error:'page size must be greater than 0 '});
        
        var queryMatch;

        if (startDateString === 'all'){
            if(type === 'all'){
                // startDate = "all" & type = "all"
                queryMatch = 
                { $match: { creationDate : { $lte : endDate }}}
            }
            else{
                // startDate = "all" & e.g. type = return
                queryMatch = 
                    {$match: {
                        $and: [
                            { creationDate : { $lte : endDate } },
                            { type : type }
                        ]
                    }}
            }
        }
        else{
            if(type === 'all'){
                // e.g. startDate = 02-02-2020 & type = "all" 
                queryMatch = 
                    {$match: {
                        $and: [
                            { creationDate : { $lte : endDate } },
                            { creationDate : { $gte : startDate } }
                        ]
                }} 
            }
            else{
                // e.g. startDate = 02-02-2020 & e.g. type = return
                queryMatch = 
                    {$match: {
                        $and: [
                            { creationDate : { $lte : endDate } },
                            { creationDate : { $gte : startDate } },
                            { type : type }
                        ]
                    }} 
            }
        }
        const invoices = await Invoice.aggregate([
            queryMatch ,
            {$facet:{
                invoices: [{ $skip: (pageNo-1) * pageSize }, { $limit: pageSize}],
                totalCount: [{ $count: 'count' }]
            }}
            ]);
        return res.send({ data: invoices[0] }); 
    }
    catch (err) {
        res.send({ error: err.toString() });
    }
}


exports.deleteTest = async (req,res) => {
    const id = req.params.id;
    if(!id) return res.send({ error:'no params in the request' });

    try{
        const deletedInvoice = await Invoice.findByIdAndDelete(id);
        res.send({ data:deletedInvoice });
    }catch(e){
        return res.send({ error: e.toString() });
    }
}