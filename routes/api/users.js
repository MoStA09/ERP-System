const express = require('express');
const router = express.Router();

const userController = require("../../controllers/userController");
const { auth } = require("../../utils/authentication");

//User Type: it and the user himself
//User Stories: 1.1.1
router.patch("/updateUser", auth(['itAuth', 'currentUserAuth']), userController.editUser);

//User Type: it and supervisor
//User Stories: 1.2.5
router.patch("/addTeamMembers/:supervisorId",
 auth(['itAuth', 'salesSupervisorAuth', 'accountingSupervisorAuth']), 
 userController.addTeamMembers);

//User Type: Sales Director
//User Stories: 5.1
router.get("/getAllSalesSupervisors", auth(['salesDirectorAuth']), userController.getAllSalesSupervisors);

//User Type: Sales Supervisor
//User Stories: 4.1
router.get("/getAllSalesMen", auth(['salesSupervisorAuth']), userController.getAllSalesMen);

//User Type: IT
//User Stories: 1.1.2
router.patch("/deleteUser/:id", auth(['itAuth']), userController.deleteUser);

//User Type: Sales Man
//User Stories: 3.1.5
router.get("/getSalesManStatistics/:startDate/:endDate", auth(['salesmanAuth']), userController.getSalesManStatistics);

//User Type: Sales Supervisor
//User Stories: 4.1.1
router.get("/getSalesTeamStatistics/:userId/:startDate/:endDate", auth(['salesSupervisorAuth']), userController.getSalesTeamStatistics);

//User Type: Sales Director
//User Stories: 5.1.1
router.get("/getAllSalesMenStatistics/:startDate/:endDate", auth(['salesDirectorAuth']), userController.getAllSalesMenStatistics);

//Get all Admins
router.get("/:type/:page/:size", auth(['currentUserAuth']), userController.getUsersType);
router.get("/:page/:size", auth(['currentUserAuth']), userController.getAllUsers);
router.post("/register", auth(['itAuth']), userController.registerUser);
router.post("/registerTest", userController.registerUser);
router.post("/login", userController.login);

router.delete("/deleteTest/:id", userController.deleteTest); 

module.exports = router;  