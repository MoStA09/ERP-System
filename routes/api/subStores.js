const express = require('express');
const router = express.Router();

const subStoreController = require('../../controllers/subStoreController');
const { auth } = require("../../utils/authentication");

//User Type: Store Director
//User Stories: 2.1.1
router.post('/createSubStore/:storeId', auth(['storeDirectorAuth']), subStoreController.createSubStore);

//User Type: Store Director
//User Stories: 2.1.8
router.patch('/addProductQuantityFromStor/:storeId/:subStoreId', auth(['storeDirectorAuth']), subStoreController.addProductQuantity);

//User Type: Store Director
//User Stories: 2.1.9
router.patch('/returnProductQuantityToStore/:storeId/:subStoreId', auth(['storeDirectorAuth']), subStoreController.returnProductQuantity);

//User Type: Store Director
//User Stories: 2.2.0
router.patch('/removeQuantitySubStore/:subStoreId/:storeId', auth(['storeDirectorAuth']), subStoreController.removeQuantitySubStore);
router.patch('/addQuantitySubStore/:subStoreId/:storeId', auth(['storeDirectorAuth']), subStoreController.addQuantitySubStore);

router.get('/getSubStores/:storeId/:page/:size', auth(['generalManagerAuth','storeDirectorAuth']), subStoreController.getSubStores);

//User Type: Store Director
//User Stories: 2.1.2
router.patch('/deleteAnEmptySubStore/:subStoreId', auth(['storeDirectorAuth']), subStoreController.deleteAnEmptySubStore);

router.delete('/deleteTest/:id',subStoreController.deleteTest);

module.exports = router;