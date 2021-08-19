const express = require('express');
const router = express.Router();

const collectionStatementController = require('../../controllers/collectionStatementController');
const { auth } = require("../../utils/authentication");

//User Type: Salesman, Collector
//User Stories: 3.1.9, 9.1.1
router.post('/collectMoney/:clientId',
 auth(['salesmanAuth', 'collectorAuth']), 
 collectionStatementController.createCollectionStatement);

//User Type: Salesman, Collector
//User Stories: 3.2.1, 9.1.3
router.put('/edit/:collectionStatementId',
 auth(['salesmanAuth', 'collectorAuth']), 
 collectionStatementController.editCollectionStatement);

//User Type: Accountant
//User Stories: 8.1.1
router.post('/approve/:collectionStatementId/:safeId',
 auth(['accountantAuth']), 
 collectionStatementController.approveCollectionStatement);

router.get("/getCollectionPdf/:id", collectionStatementController.ceratePdfCollection);
 
//User Type: Accountant

//User Stories: 8.1.3
router.patch('/disapprove/:collectionStatementId',
 auth(['accountantAuth']), 
 collectionStatementController.disapproveCollectionStatement);

//User Type : All except it and store director
//User Story : 9.1.4
router.get('/getSpecificCollectionStatements/:startDate/:endDate/:collectorId',
 auth(['salesDirectorAuth', 'collectorAuth', 'generalManagerAuth', 'salesmanAuth', 'salesSupervisorAuth', 'financialDirectorAuth', 'accountingSupervisorAuth', 'accountantAuth']),
 collectionStatementController.getSpecificCollectionStatements);

 router.delete("/deleteCollectionStatement/:collectionStatementId/", auth(['accountingSupervisorAuth']), collectionStatementController.deleteCollectionStatement);

 router.get("/getStatement/:collectionStatementId/", collectionStatementController.getStatement);


 router.delete("/deleteCollectionStatementTest/:collectionStatementId", collectionStatementController.deleteCollectionStatement);

module.exports = router;
