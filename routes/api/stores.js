const express = require('express');
const router = express.Router();

const storeController = require('../../controllers/storeController');
const { auth } = require("../../utils/authentication");

//User Types : Store Director , General Manager
//User Stories :2.2.3 & 10.1.7
router.get('/getStoreTransactionHistory/:storeId/:subStoreId/:startDate/:endDate', auth(['storeDirectorAuth', 'generalManagerAuth']), storeController.getHistoryOfStoreTransactions);

//User Type: Store Director, Sales Director, General Manager
//User Stories: 2.2.1, 5.1.5, 10.1.5
router.get('/:page/:size', auth(['storeDirectorAuth', 'generalManagerAuth', 'salesDirectorAuth']), storeController.getAllStores);

//User Type: Store Director
//User Stories: 2.1
router.post("/createStore", auth(['storeDirectorAuth']), storeController.createStore);

//User Type: Store Director
//User Stories: 2.1.6
router.patch('/removeProductQuantity/:storeId', auth(['storeDirectorAuth']), storeController.removeProductQuantity);

//User Type: Store Director
//User Stories: 2.1.4
router.patch('/addProductQuantity/:storeId', auth(['storeDirectorAuth']), storeController.addProductQuantity);

//User Type: Store Director
//User Stories: 2.1.5
router.patch('/addProductQuantityWithSupplier/:storeId', auth(['storeDirectorAuth']), storeController.addProductQuantityWithSupplier);

//User Type: Store Director
//User Stories: 2.1.7
router.patch('/removeProductQuantityWithSupplier/:storeId', auth(['storeDirectorAuth']), storeController.removeProductQuantityWithSupplier);

//User Type: Store Director
//User Stories: 2.1.3
router.patch('/deleteAnEmptyStore/:storeId', auth(['storeDirectorAuth']), storeController.deleteAnEmptyStore);

router.delete("/deleteTest/:storeId", storeController.deleteTest);

module.exports = router;
