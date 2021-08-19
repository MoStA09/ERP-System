const express = require("express");
const router = express.Router();

const chequeController = require('../../controllers/chequeController');
const { auth } = require("../../utils/authentication");

//userType: Collector || SalesMan
// user story : 9.1.2 && 3.2.0
router.post("/createCheque/:clientId", auth(['collectorAuth', 'salesmanAuth']), chequeController.createCheque );

router.get("/getCheque/:chequeId", auth(['collectorAuth', 'salesmanAuth']), chequeController.getCheque );

router.get("/getChequePdf/:id",chequeController.createChequePdf );

//userType: Accountant
//user story : 8.1.6
router.patch("/approveChequeToSafe/:chequeId/:safeId", auth(['accountantAuth']), chequeController.approveChequeToSafe );

//userType: Accountant
//user story : 8.1.7
router.patch("/approveChequeToBank/:chequeId/:safeId", auth(['accountantAuth']), chequeController.approveChequeToBank );


//userType: Accountant
//user story : 8.1.8
router.patch("/disapproveCheque/:chequeId", auth(['accountantAuth']), chequeController.disapproveCheque );

router.delete("/deleteTest/:chequeId" ,chequeController.deleteTest);

module.exports = router;

