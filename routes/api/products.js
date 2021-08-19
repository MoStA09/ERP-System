const express = require('express');
const router = express.Router();

const productController = require('../../controllers/productController');
const { auth } = require('../../utils/authentication');

//User Type: Store Director, General Manager
//User Stories: 2.2.2, 10.1.6
router.get('/viewProductsQuantity/:date_string/:storeId/:subStoreId', auth(['storeDirectorAuth', 'generalManagerAuth']), productController.viewProductsQuantity);

//made for testing
router.get('/:page/:size', productController.getAllProducts);

router.get('/getProductsNames', productController.getProductsNames);

//User Type: IT
//User Stories: 2.1.4
router.post('/addProduct', auth(['itAuth']), productController.addProduct);

//User Type: IT
//User Stories: 1.1.5 
router.delete('/deleteProduct/:id', auth(['itAuth']), productController.deleteProduct);

router.delete("/deleteTest/:productId", productController.deleteTest)
module.exports = router;