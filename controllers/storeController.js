const Store = require("../models/Store");
const User = require("../models/User");
const Supplier = require("../models/Supplier");
const ObjectId = require('mongoose').Types.ObjectId;
const storeTransactionController = require('./storeTransactionsController');
const SubStore = require("../models/SubStore");
const StoreTransaction = require("../models/StoreTransaction");


//we need user authorization
exports.createStore = async function (req, res) {
  const name = req.body.name;
  if (!name) return res.send({ error: 'Missing parameter name!' });

  try {
    const newStore = await Store.create({
      name: name,
      products: [],
    });

    return res.send({
      data: newStore,
      msg: 'A new store has been added successfully.',
    });
  } catch (err) {
    return res.send({ error: err.toString() });
  }
};

exports.removeProductQuantity = async function (req, res) {
  await editProductQuantity(req, res, 'remove', false);
}
exports.addProductQuantity = async function (req, res) {
  await editProductQuantity(req, res, 'add', false);
}
exports.removeProductQuantityWithSupplier = async function (req, res) {
  await editProductQuantity(req, res, 'remove', true);
}
exports.addProductQuantityWithSupplier = async function (req, res) {
  await editProductQuantity(req, res, 'add', true);
}

editProductQuantity = async function (req, res, action, withSupplierId) {
  const comment = req.body.comment;
  const productsArray = req.body.products;
  const storeId = req.params.storeId;
  const storeDirectorId = req.user._id;
  let supplierId = req.body.supplierId;

  if (!req.body.products)
    return res.send({ error: 'Missing parameter products' });
  if (!comment) return res.send({ error: 'Missing parameter comment' });
  if (!action || (action !== 'remove' && action !== 'add')) return res.send({ error: "Missing parameter action, can be 'remove' or 'add'" + action });
  if (!ObjectId.isValid(storeId)) return res.send({ error: 'StoreId must be an ObjectId' });
  //storeDirectorId will be taken from token

  try {
    let supplier;
    let supplierProducts
    if (withSupplierId) {
      if (!supplierId) {
        return res.send({ error: "you must specify the supplier id" })
      }
      if (!ObjectId.isValid(supplierId)) {
        return res.send({ error: 'supplierId must be an ObjectId' });
      }
      supplier = await Supplier.findById(supplierId);

      if (!supplier) return res.send({ error: 'supplier not found !' });
       supplierProducts = supplier.products;

    } else {
      supplierId = undefined;
    }

    const store = await Store.findOne({ _id: storeId });
    if (!store) return res.send({ error: 'Store not found' });

    if(store.deleted)
      return res.send({ error: 'لا يوجد مخزن بهذا الاسم' })

    let products = store.products;
    let sumPrice = 0;

    for (let i = 0; i < productsArray.length; i++) {

      let element = productsArray[i];
      let isProductFound = false;
      if (!element.productId) {
        return res.send({ error: 'Please provide a product ID for all products' });
      }
      if (!element.quantity) {
        return res.send({ error: 'Please provide a quantity for all products' });
      }

      const productId = element.productId;
      let quantity = element.quantity;
      let supplierProductFound = false;
      if(supplier) {
        
        for (let e = 0; e < supplierProducts.length; e++) {
          if (supplierProducts[e].productId.equals(productId)) {
            supplierProductFound = true;
            sumPrice += supplierProducts[e].price * quantity
            break;
          }
        }
        if (!supplierProductFound) {
          return res.send({ error: `the supplier dosen't have this product ${productId}` });
        }
      }

      if (!ObjectId.isValid(productId)) {
        return res.send({ error: 'Product ID is not a valid ObjectID' });
      }

      if (action === 'remove') {
        if (quantity < 0) {
          return res.send({ error: 'Quantity to be deducted must be larger than 0' });
        }
        else
          quantity *= -1;
      }
      else {
        if (quantity < 0) {
          return res.send({ error: 'Quantity to be added must be larger than 0' });
        }
      }

      for (let i = 0; i < products.length; i++)
        if (products[i].productId.equals(productId)) {
          isProductFound = true;
          const newQuantity = products[i].quantity + quantity;

          if (newQuantity < 0) {
            return res.send({
              error: 'Quantity to be deducted is larger than available quantity',
            });
          }

          products[i].quantity = newQuantity;
        }

      if (!isProductFound) {
        if (action === 'remove') {
          return res.send({ error: 'Product not found' });
        }
        else {
          products.push({
            productId: productId,
            quantity: quantity
          });
        }
      }
    }

    const updatedStore = await Store.findOneAndUpdate(
      { _id: storeId },
      { $set: { products } },
      { new: true }
    );

    const newTransaction = {
      storeId,
      direction: action === 'remove' ? 'out' : 'in',
      products: productsArray,
      comment,
      storeDirectorId,
      price: sumPrice,
      supplierId
    };
    const storeTransaction = await storeTransactionController.addStoreTransaction(newTransaction);

    return res.send({
      data: updatedStore,
      data2: storeTransaction,
      msg: 'Quantity of these products has been updated successfully',
    });

  } catch (error) {
    return res.send({ error: error.toString() });
  }
};

//we need user authorization
exports.getAllStores = async function (req, res) {
  if(req.params.page === "all"){
    const stores = await Store.find({deleted:{$ne:true}});
    return res.send({ data: stores });
  }
  const pageNo = parseInt(req.params.page);
  if(pageNo <= 0) return res.send({error:'page number must be greater than 0 '});
  const pageSize = parseInt(req.params.size);
  if(pageSize <= 0) return res.send({error:'page size must be greater than 0 '});
  const stores = await Store.aggregate([
    {$match : {deleted:{$ne: true}}},
    {$facet:{
        Stores: [{ $skip: (pageNo-1) * pageSize }, { $limit: pageSize}],
        totalCount: [{ $count: 'count' }]
      }}
    ]);
  return res.send({ data: stores[0] });
};
exports.deleteAnEmptyStore = async function (req, res) {

  const storeId = req.params.storeId;
  if (!storeId)
    return res.send({ error: "رجاء ادخال رقم المخزن" });
  if (!ObjectId.isValid(storeId))
    return res.send({ error: "عفوا، رقم المخزن غير صحيح" });

  try {
    const store = await Store.findById(storeId);

    if (store.deleted)
      return res.send({ error: 'لا يوجد مخزن بهذا الاسم' });

    for (let i = 0; i < store.products.length; i++) {
      if (store.products[i].quantity !== 0)
        return res.send({ error: 'عفوا، لا يزال بالمخزن بضاعة لا يمكن حزفه' });
    }

    let subStores = await SubStore.find({
      'storeId': store._id
    });

    for (let i = 0; i < subStores.length; i++) {
      let subStoreProducts = subStores[i].products;
      
      for (let j = 0; j < subStoreProducts.length; j++) {
        
        if (subStoreProducts[j].quantity !== 0)
          return res.send({ error: 'عفوا، يوجد متجر تابع لهذا المخزن لا يزال به بضاعة لذا لايمكن حزفه' });
      }

      subStores[i].deleted = true;
    }

    let deletedSubStores = [];
    for (let i = 0; i < subStores.length; i++) {
      deletedSubStores.push(await subStores[i].save());
    }

    store.deleted = true;
    const deletedStore = await store.save();
    return res.send({ data: deletedStore, data2: deletedSubStores, msg: 'تم حزف المخزن و المتاجر التابعة له بنجاح' });

  } catch (error) {
    return res.send({ error: error.toString() });
  }
}

exports.getHistoryOfStoreTransactions = async function (req, res) {
  try {
    const storeId = req.params.storeId;
    const subStoreId = req.params.subStoreId;
    const startDateString = req.params.startDate;
    const endDateString = req.params.endDate;
    let dateQuery = {};
    var subStoreEnums = ['all', 'null', 'both'];
    var startDate = new Date();
    var transactions;
    const endDate = new Date(endDateString);
    endDate.setHours(23);
    endDate.setMinutes(59);
    endDate.setSeconds(59);
    if (!ObjectId.isValid(storeId) && storeId !== 'all')
      return res.send({ error: "storeId must be an objectId" });
    if (!ObjectId.isValid(subStoreId) && !subStoreEnums.includes(subStoreId))
      return res.send({ error: "subStoreId must be an objectId" });

    if (startDateString === 'all')
      dateQuery = { creationDate: { $lte: endDate } };

    else if (startDateString !== 'all') {
      startDate = new Date(startDateString);
      dateQuery = { creationDate: { $lte: endDate, $gte: startDate } };
    }

    if (storeId === 'all') {
      //find store transactions made by all stores with creation date between startDate & endDate
      transactions = await StoreTransaction.find(dateQuery);
    }
    else {
      const requestedStore = await Store.findById(storeId);
      if (!requestedStore)
        return res.send({ error: "Store not found !" });
      else if (requestedStore.deleted)
        return res.send({ error: "The requested store is deleted" });
      //find all store transactions made by a specific store (including sub store related and non sub store related)
      if (subStoreId === 'both') {
        transactions = await StoreTransaction.find({
          $and: [dateQuery, { storeId: storeId }]
        });
      }
      //find all non sub store transactions made by a specific store
      else if (subStoreId === 'null') {
        transactions = await StoreTransaction.find({
          $and: [dateQuery, { storeId: storeId },
            { subStoreId: { $exists: false } }]
        });
      }
      //find all sub store transactions relative to a specific store
      else if (subStoreId === 'all') {
        transactions = await StoreTransaction.find({
          $and: [dateQuery,
            { storeId: storeId },
            { subStoreId: { $exists: true } }]
        });
      }
      else {
        //find specific sub store transactions relative to a specific store
        transactions = await StoreTransaction.find({
          $and: [dateQuery, { storeId: storeId }, { subStoreId: subStoreId }]
        });
      }
    }
    return res.send({ data: transactions });
  }
  catch (err) {
    return res.send({ error: err.toString() });
  }
}

exports.deleteTest = async (req, res) => {
  try {
      const deletedStore = await Store.findByIdAndDelete(req.params.storeId);
      res.send( { data: deletedStore } );
  } catch (error) {
      return res.send({ error: error.toString() });
  } 
}