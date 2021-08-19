const express = require("express");
const router = express.Router();

const clientController = require('../../controllers/clientController');
const { auth } = require("../../utils/authentication");

//(It) / user story : 1.1.6
router.post("/addClient", auth(['itAuth']), clientController.addClient )

// (It) / user story : 1.1.7
router.patch("/addSubClient/:clientId", auth(['itAuth']), clientController.addSubClient)


//User Type: Sales Director, Collector (only has access to due amount), General Manager
//User Story: 5.1.3, 9.1, 10.1
router.get("/getAllClients/:page/:size", auth(['salesDirectorAuth', 'itAuth', 'collectorAuth', 'generalManagerAuth', 'storeDirectorAuth', 'salesmanAuth', 'salesSupervisorAuth', 'financialDirectorAuth', 'accountingSupervisorAuth', 'accountantAuth']), clientController.getAllClients)
router.get("/getAllClientsInfo" , auth(['collectorAuth', 'generalManagerAuth', 'salesDirectorAuth', 'storeDirectorAuth', 'financialDirectorAuth']), clientController.getAllClientsInfo)
router.get("/getClient/:clientId" , auth(['generalManagerAuth', 'salesDirectorAuth', 'storeDirectorAuth', 'financialDirectorAuth']), clientController.getClient)

// (It) / user story : 1.2.0
router.put("/editSubClient/:clientId", auth(['itAuth']), clientController.editSubClient)

//User Type: IT
//User Story: 1.1.8, 1.1.9
router.put("/editClient/:clientId", auth(['itAuth']), clientController.editClient )

//UserStory: 1.2.2 / UserType: it
router.patch("/deleteClient/:clientId", auth(['itAuth']), clientController.deleteClient)

//UserStory: 1.2.1 / UserType: it
router.patch("/deleteSubClient/:clientId", auth(['itAuth']), clientController.deleteSubClient)

router.delete("/deleteTest/:clientId" ,clientController.deleteTest)

module.exports = router;
