const Expenses = require('./expense');
const { deleteTest, login, deleteUser } = require("./user");
const { createTestUser , loginAdmin} = require("./utils");


test("Add Expenses Category", async () => {
//this line sets the time for test to run and if it exceeds it an error is thrown
    jest.setTimeout(50000);
    
//needed fields for testing 
    const financialDirector = {
        username : "test",
        password : "test",
        type : "financial director"
    };  

//registering and logging in the user
    const logAdmin = await loginAdmin();
    const registerUser = await createTestUser(financialDirector,logAdmin.data);  
    const userId = registerUser.data2._id;

//the item we are testing for
    const Category = {
      "userId":userId,
      "name": "new Category"
    };

//calling the tested function on our testing data
    let newCategory = await Expenses.addCategory(Category,registerUser.data);
    newCategory = await Expenses.deleteExpense(newCategory.data.data._id)

//checking to see if the returned data matches our expectations
    expect(newCategory.data.data.name).toEqual('new Category');
    expect(newCategory.data.data.subCategory).toEqual([]);
    expect(newCategory.data.data.field).toEqual([]);

//deleting all the created data
    await deleteTest(registerUser.data2._id);
});


test("Add Expenses SubCategory", async () => {

//this line sets the time for test to run and if it exceeds it an error is thrown
jest.setTimeout(50000);
    
//needed fields for testing 
    const financialDirector = {
        username : "test",
        password : "test",
        type : "financial director"
    };  
    const logAdmin = await loginAdmin();
    const registerUser = await createTestUser(financialDirector,logAdmin.data);  
    const userId = registerUser.data2._id;

    const Category = {
        "userId":userId,
        "name": "new Category"
      };

    let newCategory = await Expenses.addCategory(Category,registerUser.data);
    const catId =  newCategory.data.data._id;

//the item we are testing for
    const SubCategory = {
      "name": "new sub Category"
    };

    const newSubCategory = await Expenses.addSubCategory(catId,SubCategory,registerUser.data);
    const subCatId = newSubCategory.data.data.subCategory[0]._id

    newCategory = await Expenses.deleteExpense(newCategory.data.data._id);

//checking to see if the returned data matches our expectations
    expect(newCategory.data.data.name).toEqual('new Category');
    expect(newCategory.data.data.subCategory).toEqual([{"name":"new sub Category", "_id":subCatId}]);
    expect(newCategory.data.data.field).toEqual([]);

//deleting all the created data
    await deleteTest(registerUser.data2._id);
});


test("Add Expenses Field", async () => {
//this line sets the time for test to run and if it exceeds it an error is thrown
    jest.setTimeout(50000);
    
//needed fields for testing 
    const financialDirector = {
        username : "test",
        password : "test",
        type : "financial director"
    };  
    const logAdmin = await loginAdmin();
    const registerUser = await createTestUser(financialDirector,logAdmin.data);  
    const userId = registerUser.data2._id;

    const Category = {
        "userId":userId,
        "name": "new Category"
      };

    let newCategory = await Expenses.addCategory(Category,registerUser.data);
    const catId =  newCategory.data.data._id;

//the item we are testing for
    const field = {
      "name": "field1"
    };
  //calling the tested function on our testing data
    const newField = await Expenses.addField(catId,field,registerUser.data);
    const fieldId = newField.data.data.field[0]._id;

    newCategory = await Expenses.deleteExpense(newCategory.data.data._id);

  //checking to see if the returned data matches our expectations
    expect(newCategory.data.data.name).toEqual('new Category');
    expect(newCategory.data.data.subCategory).toEqual([]);
    expect(newCategory.data.data.field).toEqual([{"name":"field1", "_id":fieldId}]);

//deleting all the created data
    await deleteTest(registerUser.data2._id);
});

test("Add Expenses Transaction", async () => {

//this line sets the time for test to run and if it exceeds it an error is thrown
    jest.setTimeout(50000);
    
//needed fields for testing 
    const financialDirector = {
        username : "test",
        password : "test",
        type : "financial director"
    };  
    const logAdmin = await loginAdmin();
    const registerUser = await createTestUser(financialDirector,logAdmin.data);  
    const userId = registerUser.data2._id;
  
    const Category = {
        "userId":userId,
        "name": "new Category"
    };
  
    let newCategory = await Expenses.addCategory(Category,registerUser.data);
    const catId =  newCategory.data.data._id;

    const SubCategory = {
      "name": "new sub Category"
    };
    const field = {
      "name": "field1"
    };

//setting up the necessary functions
    const newSubCategory = await Expenses.addSubCategory(catId,SubCategory,registerUser.data);
    const newField = await Expenses.addField(catId,field,registerUser.data);

//gathering the needed ID's
    const subCatId = newSubCategory.data.data.subCategory[0]._id
    const fieldId = newField.data.data.field[0]._id;

//calling the tested function on our testing data
  const Transaction = {
    "userId":userId,
    "expensesId":catId,
    "subCategoryId":subCatId,
    "fieldId":fieldId,
    "amount":"15",
    "comment":"test"
  };
  const newTransaction =  await Expenses.addExpensesTransaction(catId,Transaction,registerUser.data);
//checking to see if the returned data matches our expectations
    expect(newTransaction.data.data.amount).toEqual(15);
    expect(newTransaction.data.data.comment).toEqual("test");
    //expect(newTransaction.data.data.date).toBeCloseTo(Date());
    expect(newTransaction.data.data.expensesId).toEqual(catId);
    expect(newTransaction.data.data.subCategoryId).toEqual(subCatId);
    expect(newTransaction.data.data.fieldId).toEqual(fieldId);

//deleting all the created data
    await deleteTest(registerUser.data2._id);
    await Expenses.deleteExpense(newCategory.data.data._id);

});