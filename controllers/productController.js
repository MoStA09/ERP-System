const Product = require('../models/Product');
const StoreTransaction = require('../models/StoreTransaction');
const objectId = require("mongoose").Types.ObjectId;
const { convertMapToObject } = require('../utils/convertMapToObject');

exports.getAllProducts = async function (req, res) {
  if(req.params.page === "all"){
    const products = await Product.find({deleted:{$ne:true}});
    return res.send({ data: products });
  }
  const pageNo = parseInt(req.params.page);
  if(pageNo <= 0) return res.send({error:'page number must be greater than 0 '});
  const pageSize = parseInt(req.params.size);
  if(pageSize <= 0) return res.send({error:'page size must be greater than 0 '});
  const products = await Product.aggregate([
    {$match : {deleted:{$ne:true}}},
    {$facet:{
        products: [{ $skip: (pageNo-1) * pageSize }, { $limit: pageSize}],
        totalCount: [{ $count: 'count' }]
      }}
    ]);
  return res.send({ data: products[0] });
};

exports.getProductsNames = async (req,res) => {
  try{
    const products = await Product.find({});
    return res.send({data: products})
  }catch (err) {
    return res.send({ error: err.toString() });
  }
}

//we need user authorization
exports.addProduct = async function (req, res) {
    const name = req.body.name;
    const price = req.body.price;
    const tax = req.body.tax;
    const category = req.body.category;
    const unit = req.body.unit;
    if (!name || !price || !tax || !category || !unit) {
        return res.send({ error: 'Please fill in all fields!' });
    }
    else if (price <= 0) {
      return res.send({ error: 'Price must be greater than 0!' });
    }
    else if (tax < 0) {
      return res.send({ error: 'Taxes must be greater than or equal 0!' });
    }
    else if (unit <= 0) {
      return res.send({ error: 'Number of units must be greater than 0!' });
    }
    try {
      const newProduct = await Product.create(req.body);
      return res.send({ data: newProduct });
    } catch (err) {
      return res.send({ error: err.toString() });
    }
  };

  //we need user authorization
  exports.editProduct = async function (req, res){
    const productId =  req.params.productId;
    if(!objectId.isValid(productId)) return res.send({error: 'product Id is invalid or does not exist '});
    try{
        let product = await Product.findOne({_id:productId});
        if(!product) return res.send({error: 'error 404 product does not exist'});
        let name = req.body.name;
        let price = req.body.price;
        let tax = req.body.tax; 
        let category = req.body.category;
        let unit = req.body.unit;

        if(!name || typeof name !== 'string' || name === '') req.body.name = product.name;
        if(!price|| typeof price !== 'number' || price <=0 ) req.body.price = product.price
        if(!tax || typeof tax !== 'number' || tax < 0 ) req.body.tax = product.tax;
        if(!category || typeof category !== 'string' || category === '') req.body.category = product.category;
        if(!unit || typeof unit !== 'number' || unit <=0 ) req.body.unit = product.unit;
    
        product = await Product.findOneAndUpdate({_id:productId},req.body,{new:true})
        return res.send({data:product, msg: 'products has been updated successfully',});
    }
    catch(error){
      return res.send({ error: error.toString() });
    }
  };

//we need user authorization
exports.viewProductsQuantity = async function (req, res) {
  const date_string = req.params.date_string;
  const storeId = req.params.storeId;
  const subStoreId = req.params.subStoreId;
  try {
    //Date Format: mm-dd-yyyy (8-23-2020)
    //setting time to midnight to include all transactions that happened on that day
    //and get final products' quantity at the end of the day
    const dateMidnight = new Date(date_string);
    dateMidnight.setHours(23);
    dateMidnight.setMinutes(59);
    dateMidnight.setSeconds(59);
    let transactions = "";

    if (storeId === 'all')
    {
      //find store transactions made by all stores with creation date less than or equals ($lte) that date
      transactions = await StoreTransaction.find({"creationDate" : { $lte : dateMidnight }});
    }
    else {
      //find store transactions made by a specific store
      if (!objectId.isValid(storeId)) {
        return res.send({ error: "Store Id must be an objectId" });
      }
      //find all store transactions made by a specific store (including sub store related and non sub store related)
      if (subStoreId === 'both') {
        transactions = await StoreTransaction.find({
          "creationDate" : { $lte : dateMidnight },
          "storeId" : storeId});
      }
      //find all non sub store transactions made by a specific store
      else if (subStoreId === 'null') {
        transactions = await StoreTransaction.find({
          "creationDate" : { $lte : dateMidnight },
          "storeId" : storeId, 
          "subStoreId": { $exists: false }});
      }
      //find all sub store transactions relative to a specific store
      else if (subStoreId === 'all') {
        transactions = await StoreTransaction.find({
          "creationDate" : { $lte : dateMidnight },
          "storeId" : storeId, 
          "subStoreId": { $exists: true }});
      }
      else {
        //find specific sub store transactions relative to a specific store
        if (!objectId.isValid(subStoreId)) {
          return res.send({ error: "Sub Store Id must be an objectId" });
        }
        transactions = await StoreTransaction.find({
          "creationDate" : { $lte : dateMidnight },
          "storeId" : storeId, 
          "subStoreId": subStoreId});
      }
    }
    if (!transactions.length) {
      return res.send({ error: "We couldn't find any store transactions made with the provided info" });
    }
    //store transactions found with the provided info
    let productsMap = new Map();
    for (let i = 0; i < transactions.length; i++) {
      let products = transactions[i].products;
      for (let j = 0; j < products.length; j++) {
        let newQuantity = 0;
        transactions[i].direction === 'in'? newQuantity += products[j].quantity : newQuantity -= products[j].quantity; //quantity in the transaction
        //casting to string to prevent duplicate key entries
        if (productsMap.has( String(products[j].productId) )) {
          newQuantity += productsMap.get(String(products[j].productId));
        }
        productsMap.set(String(products[j].productId), newQuantity);
      }
    }
    //remove products with quantity less than 0
    for (let [product, quantity] of productsMap) {
      if(quantity <= 0) {
        productsMap.delete(product);
      }
    }
    const productsObject = convertMapToObject(productsMap);
    //you can comment the previous line, remove the convertMapToObject function and uncomment the following line if you have Node v12
    //const productsObject = Object.fromEntries(productsMap);
    return res.send( {data: productsObject} );
  } catch (err) {
    return res.send({error: err.toString()});
  }
};

exports.deleteProduct = async (req, res) => {
  const productId = req.params.id;
  if (!productId) return res.send({ error: 'there is no parameter in the request' });

  try {
    let product = await Product.findByIdAndUpdate(productId, {
      deleted: true,
    });
    if (!product) return res.send({ error: 'لا يوجد منتج ب هذا الرقم' });

    return res.send({ data: 'تم مسح المنتج بنجاح' });

  } catch (e) {
    return res.send({ error: e.toString() });  
  }
}

exports.deleteTest = async (req, res) => {
  try {
      const deletedProduct = await Product.findByIdAndDelete(req.params.productId);
      res.send( { data: deletedProduct } );
  } catch (error) {
      return res.send({ error: error.toString() });
  } 
}