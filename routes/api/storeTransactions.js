const express = require('express');
const router = express.Router();

const storeTransactionsController = require('../../controllers/storeTransactionsController');


router.get('/getStoreTransactionPdf/:id',storeTransactionsController.createPdfStoreTransaction); 

module.exports = router;  