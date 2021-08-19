const express = require("express");
const router = express.Router();

const safeController = require("../../controllers/safeController");
const { auth } = require("../../utils/authentication");

//UserStory: 8.1.0 / UserType: Accountant
router.post("/createSafe", auth(['accountantAuth']), safeController.createSafe);

//UserStory: 8.1.4 / UserType: Accountant
router.post(
  "/payOutMoneyFromSafe/:safeId",
  auth(['accountantAuth']),
  safeController.payOutMoneyFromSafe
);

//UserStory: 8.1.5 / UserType: Accountant
router.post("/addMoneyToSafe/:safeId", auth(['accountantAuth']), safeController.addMoneyToSafe);

//UserStory: 8.1.2 / UserType: Accountant
router.patch("/deleteSafe/:safeId", auth(['accountantAuth']), safeController.deleteSafe);

//User Type: Financial Director, General Manager
//User Story: 6.1.1, 10.1.2
router.get("/getAllSafes/:type/:page/:size", auth(['financialDirectorAuth', 'generalManagerAuth']), safeController.getAllSafes);

//User Types : financial director , General Manager
//User Story : 6.1.4 & 10.1.3

router.get("/getSafeTransactionHistory/:safeId/:startDate/:endDate", auth(['financialDirectorAuth', 'generalManagerAuth']),safeController.getSafeTransactionHistory);

router.get("/getSafeTransactionPdf/:id", safeController.createPdfSafe); 

router.delete("/deleteTest/:id",safeController.deleteTest); 

router.delete("/deleteSafeTransactionTest/:id",safeController.deleteSafeTransactionTest);
 
router.delete("/EraseSafe/:safeId",safeController.EraseSafe);

module.exports = router;