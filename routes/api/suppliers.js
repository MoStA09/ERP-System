const express = require('express');
const router = express.Router();

const supplierController = require('../../controllers/supplierController');
const { auth } = require("../../utils/authentication");

router.get('/:page/:size',supplierController.getAllSuppliers)

router.get('/:supplierId',supplierController.getSupplier)

router.post('/createSupplier', auth(['itAuth']), supplierController.createSupplier);

router.patch('/addProductsToSupplier/:supplierId', auth(['itAuth']), supplierController.addProductsToSupplier);

router.patch('/removeProductsFromSupplier/:supplierId', auth(['itAuth']), supplierController.removeProductsFromSupplier);

router.patch('/editSupplierName/:supplierId', auth(['itAuth']), supplierController.editSupplierName);

router.patch('/editPriceOfProducts/:supplierId', auth(['itAuth']), supplierController.editPriceOfProducts);

//User Types : General Manager
//User Story : 10.1.8
router.get("/getSupplierDueAmount/:supplierId", auth(['generalManagerAuth']),supplierController.getSupplierDueAmount);

//User Types : General Manager
//User Story : 10.1.9
router.get("/getTotalDueAmount", auth(['generalManagerAuth']),supplierController.getTotalDueAmount);

router.delete("/deleteTest/:supplierId",supplierController.deleteTest);

module.exports = router;