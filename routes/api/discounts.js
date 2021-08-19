const express = require('express');
const router = express.Router();

const discountController = require('../../controllers/discountController');
const { auth } = require("../../utils/authentication");

//User Type: Financial Director, Accounting Supervisor
//User Stories: 6.2.4 & 7.1.3
router.post('/createDiscount/:clientId/:productId',
 auth(['financialDirectorAuth', 'accountingSupervisorAuth']), 
 discountController.createDiscount);

router.delete('/deleteTest/:id', auth(['financialDirectorAuth', 'accountingSupervisorAuth']), discountController.deleteTest);
module.exports = router;