const express = require('express');
const router = express.Router();

const invoiceController = require('../../controllers/invoiceController');
const { auth } = require("../../utils/authentication");

//User Type: sales man & sales supervisor
//User Stories: 3.1.0, 3.1.2, 4.1.4, 4.1.6
router.post('/createInvoice/:clientId/:subClientName',
 auth(['salesSupervisorAuth', 'salesmanAuth']), 
 invoiceController.createInvoice);

//(salesman) / user story: 3.1.1
router.post("/editInvoice/:invoiceId",
 auth(['salesmanAuth']), 
 invoiceController.editInvoice);
//Userstory :4.1.2 /UserType:sales supervisor
router.get("/getAllSalesAndReturnInvoicesByTeam/:startDate/:endDate",
 auth(['salesSupervisorAuth']),
 invoiceController.getTeamSalesAndReturnInvoices);

//UserStory: 3.1.6 / UserType: sales man
router.post('/scheduleFutureInvoice/:clientId/:subClientName',
 auth(['salesmanAuth']), 
 invoiceController.scheduleFutureInvoice);

//UserStory: 4.1.3,3.1.4/ UserType: sales supervisor & salesman
router.get('/getSpecificInvoices/:startDate/:endDate',
 auth(['salesSupervisorAuth', 'salesmanAuth']), 
 invoiceController.getSpecificInvoices);
//UserStory: 4.1.8 / UserType: sales supervisor

//TODO: ASK YAHIA
router.post('/scheduleInvoiceToSalesman/:clientId/:subClientName/:salesSupervisorID',
 auth(['salesSupervisorAuth']), 
 invoiceController.scheduleInvoiceToSalesman);

//(sales supervisor) / User story: 4.1.9
router.post("/editFutureInvoice/:invoiceId",
 auth(['salesSupervisorAuth']),
 invoiceController.editFutureInvoice);

router.get("/getInvoicePdf/:id", invoiceController.createPdfInvoice);

   
//Userstory :6.2 , 6.2.2 /UserType:financial director, accounting supervisor
router.post("/createEmptyInvoice/:clientId",
 auth(['financialDirectorAuth', 'accountingSupervisorAuth']),
 invoiceController.createEmptyInvoice);

//Userstory :6.1.9 , 7.1 , 10.1.1 /UserType:financial director , accounting supervisor , general manager
router.get("/getInvoices/:startDate/:endDate/:type/:page/:size",
 auth(['financialDirectorAuth', 'accountingSupervisorAuth', 'generalManagerAuth']), 
 invoiceController.getInvoices);

//Userstory :6.2.1 , 6.2.3 /UserType:financial director, accounting supervisor
router.post("/createEmptyReturnInvoice/:clientId", 
 auth(['financialDirectorAuth', 'accountingSupervisorAuth']), 
 invoiceController.createEmptyReturnInvoice);


router.delete("/deleteInvoice/:id", invoiceController.deleteTest); 

  
module.exports = router;
