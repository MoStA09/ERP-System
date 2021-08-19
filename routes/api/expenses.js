const express = require("express");
const router = express.Router();

const expensesController = require("../../controllers/expensesController");
const { auth } = require("../../utils/authentication");

//UserStory: 6.1.5 / UserType: Financial Director
router.post("/addCategory", auth(['financialDirectorAuth']), expensesController.addCategory);

//UserStory: 6.1.6 / UserType: Financial Director
router.patch("/addSubCategory/:expenseId", auth(['financialDirectorAuth']), expensesController.addSubCategory);

//UserStory: 6.2.5 / UserType: Financial Director
router.patch("/addField/:expenseId", auth(['financialDirectorAuth']), expensesController.addField);

//UserStory: 6.1.7 / UserType: Financial Director
router.post("/addExpensesTransaction/:expensesId",
 auth(['financialDirectorAuth']), 
 expensesController.addExpensesTransaction);

router.get("/getExpensePdf/:id", expensesController.createPdfExpense);

//UserStory: 6.1.8 && 10.1.4 / UserType: Financial Director $ General Manager
router.get("/seeExpenseHistory/:expensesId/:subCatId/:fieldId/:startDate/:endDate",
 auth(['financialDirectorAuth', 'generalManagerAuth']), 
 expensesController.seeExpenseHistory);


router.delete("/deleteExpense/:expenseId", expensesController.deleteExpense);


module.exports = router;
