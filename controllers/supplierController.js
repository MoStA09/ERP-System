const Supplier = require("../models/Supplier");
const ObjectId = require('mongoose').Types.ObjectId;
const StoreTransaction = require("../models/StoreTransaction");
const Invoice = require("../models/Invoice");
const { convertMapToObject } = require('../utils/convertMapToObject');


exports.getAllSuppliers = async (req,res) => {
  try{
  if(req.params.page === "all"){
    const products = await Product.find({deleted:{$ne:true}});
    return res.send({ data: products });
  }
  const suppliers = await Supplier.find({});
  return res.send({data: suppliers})
  }catch(e) {
    return res.send({ error: e.toString() });
  }
}

exports.getSupplier = async (req,res) => {
  try{
  const supplier = await Supplier.findById(req.params.supplierId);
  return res.send({data: supplier})
  }catch(e) {
    return res.send({ error: e.toString() });
  }
}


//We need user authorization
exports.createSupplier = async function (req, res) {
  const name = req.body.name;
  if (!name) return res.send({ error: 'Please provide a name in order to create a new supplier' });

  try {
    const newSupplier = await Supplier.create({
      name: name,
      products: [],
    });

    return res.send({
      data: newSupplier,
      msg: 'A new supplier has been added successfully.',
    });
  } catch (err) {
    return res.send({ error: err.toString() });
  }
};

exports.addProductsToSupplier = async function (req, res) {
  await editSupplier(req, res, 'addProducts');
}
exports.removeProductsFromSupplier = async function (req, res) {
  await editSupplier(req, res, 'removeProducts');
}

exports.editSupplierName = async function (req, res) {
  await editSupplier(req, res, null);
}

exports.editPriceOfProducts = async function (req, res) {
  await editSupplier(req, res, 'editPriceOfProducts');
}

//We need user authorization
editSupplier = async function (req, res, action) {

  const supplierId = req.params.supplierId;

  if (!ObjectId.isValid(supplierId))
    return res.send({ error: 'SupplierId is not a valid ObjectId' });

  try {

    const supplier = await Supplier.findById(supplierId);

    if (req.body.name) {
      supplier.name = req.body.name;
      const updatedSupplier = await supplier.save();
      return res.send({ data: updatedSupplier });
    }

    if (!req.body.products)
      return res.send({ error: 'Please provide the parameter products' });

    const productsArray = req.body.products;

    let products = supplier.products;

    //If we get 'all' in the request.body.products instead of the list of products then all products are deleted.
    if (action === 'removeProducts' && productsArray === 'all') {
      supplier.products = [];
      const newSupplier = await supplier.save();
      return res.send({ data: newSupplier });
    }

    //Looping over all incomming products.
    for (let i = 0; i < productsArray.length; i++) {
      let element = productsArray[i];

      if (!element.productId)
        return res.send({ error: 'Please provide a productId for all products' });

      if (!ObjectId.isValid(element.productId))
        return res.send({ error: 'SupplierId is not a valid ObjectId' });

      let productIndex = -1;

      //Looping over all products the supplier have to check if the supplier have the incomming product.
      for (let j = 0; j < products.length; j++) {
        if (products[j].productId.equals(element.productId)) {
          productIndex = j;
          break;
        }
      }
      //If a product needs to be removed and does not exist, error is received.
      if (action === 'removeProducts') {
        if (productIndex === -1) {
          return res.send({ error: 'Product not found' });
        }
        products.splice(productIndex, 1);

        //If a product needs to be added and it already exists in the supplier we get an error.
      } else if (action === 'addProducts') {

        if (!element.price)
          return res.send({ error: 'Please provide a price for all products' });

        if (productIndex !== -1) {
          return res.send({ error: 'Product already exists' });
        }
        products.push(element);

        //If a product's price needs to be changed without the price we will get an error.
      } else if (action === 'editPriceOfProducts') {

        if (!element.price)
          return res.send({ error: 'Please provide a price for all products' });

        if (productIndex !== -1) {
          products[productIndex].price = element.price;
        } else {
          return res.send({ error: 'Product does not exist' });
        }

      }
    }

    //Updating the supplier in the database.
    supplier.products = products;
    const updatedSupplier = await supplier.save();

    return res.send({ data: updatedSupplier });

  } catch (error) {
    return res.send({ error: error.toString() });
  }
}

exports.getSupplierDueAmount = async function (req, res) {
  
  const supplierId = req.params.supplierId;

  if (!supplierId || !ObjectId.isValid(supplierId)) return res.send({ error: 'Invalid supplier ID' });
  try {
    let supplier = await Supplier.findById(supplierId);

    if (!supplier) return res.send({ error: 'Supplier not found' });

    supplier = await getSupplierInfo(supplier);

    if (supplier instanceof Error)
      return res.send({ error: 'Something went wrong!' });

    return res.send({ data: supplier.totalDue, data2: supplier });
  } catch (error) {
    return res.send({ error: error.toString() });
  }
}

exports.getTotalDueAmount = async function (req, res) {
  
  try {
    let suppliers = await Supplier.find();
    let totalDueAmount = 0;
    for (let i = 0; i < suppliers.length; i++) {
      suppliers[i] = await getSupplierInfo(suppliers[i]);
      totalDueAmount += suppliers[i].totalDue;

      if (suppliers[i] instanceof Error) {
        return res.send({ error: 'Something went wrong!' });
      }

    }

    return res.send({ data: totalDueAmount, data2: suppliers });
  } catch (err) {
    return res.send({ error: err.toString() });
  }
}

getSupplierInfo = async function (supplier) {
  const supplierId = supplier._id;

  try {
  
    //Getting invoices info
    let invoicesQuery = await Invoice.aggregate([
      { $match: { $and: [{ clientId: supplierId }, { type: { $in: ['emptyCharge', 'emptyDischarge'] } }] } },
      {
        $facet: {
          //Getting total price of invoices with type "emptyCharge"
          invoiceEmptyChargedTotal: [{ $match: { type: "emptyCharge" } }, { $group: { _id: null, sum: { $sum: "$totalPrice" } } }  ],
          //Getting total price of invoices with type "emptyDischarge"
          invoiceEmptyDischargedTotal: [{ $match: { type: 'emptyDischarge' } }, { $group: { _id: null, sum: { $sum: "$totalPrice" } } } ],
          //getting all invoices
          invoices: [{ $match: { clientId: supplierId } }],
        }
      }
    ]);

    //Getting transactions info
    let transactionsQuery = await StoreTransaction.aggregate([
      { $match: { supplierId }},
      {
        $facet: {
          //Getting total price of transactions with direction "in"
          storeTransactionsIn: [{ $match: { direction: "in" } }, { $group: { _id: null, sum: { $sum: "$price" } } }  ],
          //Getting total price of invoices with direction "out"
          storeTransactionsOut: [{ $match: { direction: "out" } }, { $group: { _id: null, sum: { $sum: "$price" } } } ],
          //getting all transactions
          storeTransactions: [{ $match: { supplierId } }],
        }
      }
    ]); 

    let storeTransactions = transactionsQuery[0].storeTransactions;
    let invoices = invoicesQuery[0].invoices;

    let invoiceEmptyChargedTotal = invoicesQuery[0].invoiceEmptyChargedTotal;
    let invoiceEmptyDischargedTotal = invoicesQuery[0].invoiceEmptyDischargedTotal;
    let storeTransactionsIn = transactionsQuery[0].storeTransactionsIn;
    let storeTransactionsOut = transactionsQuery[0].storeTransactionsOut;
    
    //Getting productQuantity by adding the ones with direction 'in' and subtracting the ones with direction 'out' 
    let productsMap = new Map(); 

    for (var i = 0; i < storeTransactions.length; i++) { //Looping over the transactions to get all products
      let products = storeTransactions[i].products;

      for (let j = 0; j < products.length; j++) { //Looping over the products to check if the productsMap have it or not
        let newQuantity = 0;                      //and if so only the quantity will be affected otherwise the product will be added
        newQuantity += products[j].quantity;

        if (productsMap.has(String(products[j].productId))) {
          if (storeTransactions[i].direction === 'out')
            newQuantity *= -1;
          newQuantity += productsMap.get(String(products[j].productId));
        }
        productsMap.set(String(products[j].productId), newQuantity);
      }
    }

    const productsQuantity = convertMapToObject(productsMap);

    //Extracting the real sum from the object returned from the aggregation function or setting it as 0 if sum not found
    if (!invoiceEmptyChargedTotal || invoiceEmptyChargedTotal.length !== 0) invoiceEmptyChargedTotal = invoiceEmptyChargedTotal[0].sum;
    else invoiceEmptyChargedTotal = 0;
    if (!invoiceEmptyDischargedTotal || invoiceEmptyDischargedTotal.length !== 0) invoiceEmptyDischargedTotal = invoiceEmptyDischargedTotal[0].sum;
    else invoiceEmptyDischargedTotal = 0;
    if (!storeTransactionsIn || storeTransactionsIn.length !== 0) storeTransactionsIn = storeTransactionsIn[0].sum;
    else storeTransactionsIn = 0;
    if (!storeTransactionsOut || storeTransactionsOut.length !== 0) storeTransactionsOut = storeTransactionsOut[0].sum;
    else storeTransactionsOut = 0;

    //Calculating the totalDue amount from transactions and invoices
    const totalDueFromTransactions = storeTransactionsIn - storeTransactionsOut;
    const totalDueFromInvoices = invoiceEmptyChargedTotal - invoiceEmptyDischargedTotal;

    //Editing the Supplier object to add the info we gathered
    supplier = JSON.parse(JSON.stringify(supplier));

    //Calculating the totalDue
    supplier.totalDue = totalDueFromTransactions + totalDueFromInvoices;

    //Calculating the invoices of type charge and invoices of type discharge
    supplier.invoiceEmptyChargedTotal = invoiceEmptyChargedTotal;
    supplier.invoiceEmptyDischargedTotal = invoiceEmptyDischargedTotal;
    supplier.totalDueFromInvoices = totalDueFromInvoices;

    //Calculating the transactionsIn and transactionsOut
    supplier.storeTransactionsIn = storeTransactionsIn;
    supplier.storeTransactionsOut = storeTransactionsOut;
    supplier.totalDueFromTransactions = totalDueFromTransactions;

    //Adding all invoices and transactions to the response
    supplier.invoices = invoices;
    supplier.storeTransactions = storeTransactions;

    supplier.productsQuantity = productsQuantity;
    
    return supplier;

  } catch (error) {
    return error;
  }
}

exports.deleteTest = async (req, res) => {
  try {
      const deletedSupplier = await Supplier.findByIdAndDelete(req.params.supplierId);
      res.send( { data: deletedSupplier } );
  } catch (error) {
      return res.send({ error: error.toString() });
  } 
}
