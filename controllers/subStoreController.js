const SubStore = require('../models/SubStore');
const Store = require('../models/Store');
const storeTransactionController = require('./storeTransactionsController');
const ObjectId = require('mongoose').Types.ObjectId;

//We need user authorization
exports.getSubStores = async (req,res) => {
    const storeId = req.params.storeId;
    if(req.params.page === "all"){
      const subStores = await SubStore.find({storeId: ObjectId(storeId), deleted:{$ne: true}});
      return res.send({ data: subStores });
    }
    const pageNo = parseInt(req.params.page);
    if(pageNo <= 0) return res.send({error:'page number must be greater than 0 '});
    const pageSize = parseInt(req.params.size);
    if(pageSize <= 0) return res.send({error:'page size must be greater than 0 '});
    const subStores = await SubStore.aggregate([
    {$match : {storeId: ObjectId(storeId), deleted:{$ne: true}}},
    {$facet:{
        subStores: [{ $skip: (pageNo-1) * pageSize }, { $limit: pageSize}],
        totalCount: [{ $count: 'count' }]
      }}
    ]);
  return res.send({ data: subStores[0] });
}

//We need user authorization
exports.createSubStore = async (req, res) => {
  const name = req.body.name;
  if (!name) return res.send({ error: 'Missing parameter name' });
  if (!req.params.storeId)
    return res.send({ data: 'Missing parameter storeId' });
  try {
    const store = await Store.findOne({ _id: req.params.storeId });
    if (!store)
      return res.send({ error: 'StoreId does not exist in database' });

    if (store.deleted)
      return res.send({ error: 'لا يوجد مخزن بهذا الاسم' })

    const newSubStore = await SubStore.create({
      name,
      products: [],
      storeId: req.params.storeId,
    });
    return res.send({ data: newSubStore });
  } catch (err) {
    return res.send({ error: err.toString() });
  }
};

exports.removeQuantitySubStore = async function (req, res) {
  const { comment } = req.body;
  const productsArray = req.body.products;
  const subStoreId = req.params.subStoreId;
  const storeDirectorId = req.user._id;
  if (!productsArray)
    return res.send({ error: 'Missing parameter list of products' });
  if (!comment) return res.send({ error: 'Missing parameter comment' });
  if (!ObjectId.isValid(subStoreId))
    return res.send({ error: 'SubStoreId must be an ObjectId' });

  //storeDirectorId will be taken from token
  
  try {
    let productId = '';
    let quantity = '';
    let sub = await SubStore.findOne({ _id: subStoreId });
    if (!sub) return res.send({ error: 'Sub-Store not found' });

    if(subStore.deleted)
      return res.send({ error: 'لا يوجد متجر بهذا الاسم' })

    const storeId = sub.storeId;
    let products = sub.products;

    for (let i = 0; i < productsArray.length; i++) {

      let element = productsArray[i];
      let isProductFound = false;

      if (!element.productId) {
        return res.send({ error: 'Please provide a product ID' });
      }
      if (!element.quantity) {
        return res.send({ error: 'Please provide a quantity' });
      }

      productId = element.productId;
      quantity = element.quantity;

      if (!ObjectId.isValid(productId)) {
        return res.send({ error: 'Product ID is not a valid ObjectID' });
      }

      if (quantity < 0) {
        return res.send({
          error: 'Quantity to be deducted must be larger than 0',
        });
      }

      for (let i = 0; i < products.length; i++) {
        if (products[i].productId.equals(productId)) {
          isProductFound = true;
          const newQuantity = products[i].quantity - quantity;

          if (newQuantity < 0) {
            return res.send({
              error:
                'Quantity to be deducted is larger than available quantity',
            });
          }

          products[i].quantity = newQuantity;
        }
      }
      if (!isProductFound) {
        return res.send({ error: 'Product not found' });
      }
    }

    const updatedSubStore = await SubStore.findOneAndUpdate(
      { _id: subStoreId },
      { $set: { products } },
      { new: true }
    );
    const newTransaction = {
      storeId,
      subStoreId,
      direction: 'out',
      products: productsArray,
      comment,
      storeDirectorId,
      price: 0,
    };
    const storeTransaction = await storeTransactionController.addStoreTransaction(
      newTransaction
    );
    return res.send({
      data: updatedSubStore,
      data2: storeTransaction,
      msg: 'Quantity of these products has been updated successfully',
    });
  } catch (error) {
    return res.send({ error: error.toString() });
  }
};

exports.addQuantitySubStore = async function (req, res) {
  const { comment } = req.body;
  const productsArray = req.body.products;
  const subStoreId = req.params.subStoreId;
  const storeDirectorId = req.user._id;
  if (!productsArray)
    return res.send({ error: 'Missing parameter list of products' });
  if (!comment) return res.send({ error: 'Missing parameter comment' });
  if (!ObjectId.isValid(subStoreId))
    return res.send({ error: 'SubStoreId must be an ObjectId' });

  try {
    let productId = '';
    let quantity = '';
    let sub = await SubStore.findOne({ _id: subStoreId });
    if (!sub) return res.send({ error: 'Sub-Store not found' });

    if(subStore.deleted)
      return res.send({ error: 'لا يوجد متجر بهذا الاسم' })

    const storeId = sub.storeId;
    let products = sub.products;

    for (let i = 0; i < productsArray.length; i++) {

      let element = productsArray[i];
      let isProductFound = false;

      if (!element.productId) {
        return res.send({ error: 'Please provide a product ID' });
      }
      if (!element.quantity) {
        return res.send({ error: 'Please provide a quantity' });
      }

      productId = element.productId;
      quantity = element.quantity;

      if (!ObjectId.isValid(productId)) {
        return res.send({ error: 'Product ID is not a valid ObjectID' });
      }

      if (quantity < 0) {
        return res.send({
          error: 'Quantity to be deducted must be larger than 0',
        });
      }

      for (let i = 0; i < products.length; i++) {
        if (products[i].productId.equals(productId)) {
          isProductFound = true;
          const newQuantity = products[i].quantity + quantity;
          products[i].quantity = newQuantity;
        }
      }
      if (!isProductFound) {
        products.push(element)
      }
    }

    const updatedSubStore = await SubStore.findOneAndUpdate(
      { _id: subStoreId },
      { $set: { products } },
      { new: true }
    );
    const newTransaction = {
      storeId,
      subStoreId,
      direction: 'in',
      products: productsArray,
      comment,
      storeDirectorId,
      price: 0,
    };
    const storeTransaction = await storeTransactionController.addStoreTransaction(
      newTransaction
    );
    return res.send({
      data: updatedSubStore,
      data2: storeTransaction,
      msg: 'Quantity of these products has been updated successfully',
    });
  } catch (error) {
    return res.send({ error: error.toString() });
  }
};

exports.returnProductQuantity = async function (req, res) {
  await editProductInSubStore(req, res, 'returnFromSubStore');
};
exports.addProductQuantity = async function (req, res) {
  await editProductInSubStore(req, res, 'addToSubStore');
};

editProductInSubStore = async function (req, res, action) {
  const bodyProducts = req.body.products;
  const subStoreId = req.params.subStoreId;
  const storeId = req.params.storeId;
  const storeDirectorId = req.user._id;

  if (!req.body.comment)
    return res.send({ error: 'Missing parameter comment' });
  if (
    !action ||
    (action !== 'returnFromSubStore' && action !== 'addToSubStore')
  )
    return res.send({
      error: "Missing parameter action, can be 'return' or 'add'" + action,
    });
  if (!ObjectId.isValid(subStoreId))
    return res.send({ error: 'SubStoreId must be an ObjectId' });

  try {
    let subStore = await SubStore.findOne({ _id: subStoreId });
    if (!subStore) return res.send({ error: 'sub store not found' });

    if(subStore.deleted)
      return res.send({ error: 'لا يوجد متجر بهذا الاسم' })

    let store = await Store.findOne({ _id: storeId });
    if (!store) {
      return res.send({ error: 'store not found' });
    }

    if(store.deleted)
      return res.send({ error: 'لا يوجد مخزن بهذا الاسم' })

    let subStoreProducts = subStore.products;
    let storeProducts = store.products;

    for (let i = 0; i < bodyProducts.length; i++) {
      if (!bodyProducts[i].productId) {
        throw new Error('Please provide a product ID');
      }
      if (!bodyProducts[i].quantity) {
        throw new Error('Please provide a quantity');
      }

      if (bodyProducts[i].quantity < 1) {
        throw new Error('please enter positive value for the quantity');
      }

      if (!ObjectId.isValid(bodyProducts[i].productId)) {
        throw new Error('Product ID is not a valid ObjectID');
      }

      let storeProduct = null;

      for (let e = 0; e < storeProducts.length; e++) {
        if (storeProducts[e].productId.equals(bodyProducts[i].productId)) {

          if (action === 'addToSubStore') {
            storeProducts[e].quantity -= bodyProducts[i].quantity;
          }
          else if (action === 'returnFromSubStore') {
            storeProducts[e].quantity += bodyProducts[i].quantity;
          }

          if (storeProducts[e].quantity < 0) {
            throw new Error(
              `the quantity for product ${bodyProducts[i].productId} can't be less than 0 `
            );
          }

          storeProduct = bodyProducts[i];
          break;
        }
      }

      if (!storeProduct) {
        if (action === 'addToSubStore') {
          throw new Error(
            `there is no product in the store with that id ${bodyProducts[i].productId} `
          );
        } else if (action === 'returnFromSubStore') {
          storeProducts.push(bodyProducts[i]);
        }
      }

      let subStoreProduct = null;
      for (let e = 0; e < subStoreProducts.length; e++) {
        if (subStoreProducts[e].productId.equals(bodyProducts[i].productId)) {

          if (action === 'addToSubStore') {
            subStoreProducts[e].quantity += bodyProducts[i].quantity;
          }
          else if (action === 'returnFromSubStore') {
            subStoreProducts[e].quantity -= bodyProducts[i].quantity;
          }

          if (subStoreProducts[e].quantity < 0) {
            throw new Error(
              `the quantity for product ${bodyProducts[i].productId} can't be less than 0 `
            );
          }

          subStoreProduct = bodyProducts[i];
          break;
        }
      }

      if (!subStoreProduct) {
        if (action === 'addToSubStore') {
          subStoreProducts.push(bodyProducts[i]);
        } else if (action === 'returnFromSubStore') {
          throw new Error(
            `there is no product in the subStore with that id ${bodyProducts[i].productId} `
          );
        }
      }
    }

    const updatedSubStore = await SubStore.findOneAndUpdate(
      { _id: subStoreId },
      { $set: { products: subStoreProducts } },
      { new: true }
    );

    const updatedStore = await Store.findOneAndUpdate(
      { _id: storeId },
      { $set: { products: storeProducts } },
      { new: true }
    );

    let newTransaction = {
      storeId,
      direction: action === 'returnFromSubStore' ? 'in' : 'out',
      products: bodyProducts,
      comment: req.body.comment,
      storeDirectorId,
      price: 0,
    };

    const storeTransaction = await storeTransactionController.addStoreTransaction(
      newTransaction
    );

    const subStoreTransaction = await storeTransactionController.addStoreTransaction(
      { ...newTransaction, storeId: updatedSubStore.storeId, subStoreId, direction: action === 'returnFromSubStore' ? 'out' : 'in', }
    );

    return res.send({
      data: updatedSubStore,
      data2: updatedStore,
      data3: subStoreTransaction,
      data4: storeTransaction,
      msg: 'Quantity of these products has been updated successfully',
    });
  } catch (error) {
    return res.send({ error: error.toString() });
  }
};

exports.deleteAnEmptySubStore = async function (req, res) {

  const subStoreId = req.params.subStoreId;
  if (!subStoreId)
    return res.send({ error: "رجاء ادخال رقم المتجر" });
  if (!ObjectId.isValid(subStoreId))
    return res.send({ error: "عفوا، رقم المتجر غير صحيح" });

  try {
    const subStore = await SubStore.findById(subStoreId);

    if (subStore.deleted)
      return res.send({ error: 'لا يوجد متجر بهذا الاسم' })

    for (let j = 0; j < subStore.products.length; j++) {

      if (subStore.products[j].quantity !== 0)
        return res.send({ error: 'عفوا، يوجد بضاعة لذا لايمكن حزفه' });
    }
    subStore.deleted = true;
    const updatedSubStore = await subStore.save();
    return res.send({ data: updatedSubStore, msg: 'تم حزف المتجر بنجاح' });

  } catch (error) {
    return res.send({ error: error.toString() });
  }

}

exports.deleteTest = async (req, res) => {
  try { 
      const deletedSubStore = await SubStore.findByIdAndDelete(req.params.id);
      res.send( { data: deletedSubStore } );
  } catch (error) {
      return res.send({ error: error.toString() });
  } 
}