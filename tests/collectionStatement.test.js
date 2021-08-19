const collectionStatements = require('./collectionStatement');
const client = require("./client");
const user = require("./user");
const { createTestUser , loginAdmin} = require("./utils");

test("collect Money", async () => {
//this line sets the time for test to run and if it exceeds it an error is thrown
  jest.setTimeout(500000);

//created the needed data to test
  const Client = {
    "name":"addClientTestClient",
  };

  const salesMan ={
      "username":"salesman",
      "password":"123",
      "type":"salesman"
  }
  const logAdmin = await loginAdmin();

  const registerSalesMan = await createTestUser(salesMan,logAdmin.data);

  const salesManId = registerSalesMan.data2._id;

  const registerUser = await client.addClient(Client, logAdmin.data); 

  const clientId = registerUser.data.data._id;

//object to be tested
  let Statement = {
    "clientId":clientId,
    "userId": salesManId,
    "amount": 55,
    "comment": "test"
  };
//calling the tested function on our testing data
  const newStatement = await collectionStatements.collectMoney(clientId,Statement,registerSalesMan.data);
  const statementId = newStatement.data.data._id;

//checking to see if the returned data matches our expectations
    expect(newStatement.data.data.userId).toEqual(salesManId);
    expect(newStatement.data.data._id).toEqual(statementId);
    expect(newStatement.data.data.amount).toEqual(55);
    expect(newStatement.data.data.state).toEqual('on hold');

//deleting the created data
  await client.deleteTest(clientId);
  await user.deleteTest(salesManId);
  await collectionStatements.deleteCollectionStatement(statementId);

});

test("Edit Collection Statement", async () => {
//this line sets the time for test to run and if it exceeds it an error is thrown
  jest.setTimeout(500000);

//created the needed data to test
    const Client = {
      "name":"addClientTestClient",
    };
  
    const salesMan ={
        "username":"salesman",
        "password":"123",
        "type":"salesman"
    }


    const logAdmin = await loginAdmin();
  
    const registerSalesMan = await createTestUser(salesMan,logAdmin.data);
  
    const salesManId = registerSalesMan.data2._id;
  
    const registerUser = await client.addClient(Client, logAdmin.data); 
  
    const clientId = registerUser.data.data._id;

      let Statement = {
      "clientId":clientId,
      "userId": salesManId,
      "amount": 55,
      "comment": "test"
    };
    const firstStatement = await collectionStatements.collectMoney(clientId,Statement,registerSalesMan.data);

//object to be tested
    let newStatement = {
      "clientId":clientId,
      "userId": salesManId,
      "amount": 5,
      "comment": "test"
    };
//calling the tested function on our testing data
    const editedStatement = await collectionStatements.editCollectionStatement(firstStatement.data.data._id,newStatement,registerSalesMan.data);
    const statementId = editedStatement.data.data._id;

//checking to see if the returned data matches our expectations
  expect(editedStatement.data.data.userId).toEqual(salesManId);
  expect(editedStatement.data.data._id).toEqual(statementId);
  expect(editedStatement.data.data.amount).toEqual(5);
  expect(editedStatement.data.data.state).toEqual('on hold');
//deleting the created data
  await client.deleteTest(clientId);
  await user.deleteTest(salesManId);
  await collectionStatements.deleteCollectionStatement(statementId);
});


test("disapprove Collection Statement", async () => {
//this line sets the time for test to run and if it exceeds it an error is thrown
jest.setTimeout(500000);

//created the needed data to test
    const Client = {
      "name":"addClientTestClient",
    };
  
    const salesMan ={
        "username":"salesman",
        "password":"123",
        "type":"salesman"
    }

    const Accountant ={
      "username":"accountant",
      "password":"123",
      "type":"accountant"
  }

    const logAdmin = await loginAdmin();
  
    const registerSalesMan = await createTestUser(salesMan,logAdmin.data);

    const registerAccountant = await createTestUser(Accountant,logAdmin.data);

    const salesManId = registerSalesMan.data2._id;
  
    const registerClient= await client.addClient(Client, logAdmin.data); 
  
    const clientId = registerClient.data.data._id;

//testing data
  let Statement = {
    "clientId":clientId,
    "userId": salesManId,
    "amount": 0,
    "comment": "la2a"
  };
  const newStatement = await collectionStatements.collectMoney(clientId,Statement,registerSalesMan.data);

//calling the tested function on our testing data
    const rejectedStatement = await collectionStatements.disapproveCollectionStatement(newStatement.data.data._id,newStatement,registerAccountant.data);
    const statementId = rejectedStatement.data.data._id;

//checking to see if the returned data matches our expectations
    expect(rejectedStatement.data.data.state).toEqual("rejected");
//deleting the created data
    await client.deleteTest(clientId);
    await user.deleteTest(salesManId);
    await user.deleteTest(Accountant);
    await collectionStatements.deleteCollectionStatement(statementId);
});


test("approve Collection Statement", async () => {
//this line sets the time for test to run and if it exceeds it an error is thrown
jest.setTimeout(500000);

//created the needed data to test
    const Client = {
      "name":"addClientTestClient",
    };
  
    const salesMan ={
        "username":"salesman",
        "password":"123",
        "type":"salesman"
    }

    const Accountant ={
      "username":"accountant",
      "password":"123",
      "type":"accountant"
  }

   const safe = {
    "name":"safe",
    "currency":"USD",
    "amount":100,
    "type":"Bank"
  }

    const logAdmin = await loginAdmin();
  
    const registerSalesMan = await createTestUser(salesMan,logAdmin.data);

    const registerAccountant = await createTestUser(Accountant,logAdmin.data);

    const salesManId = registerSalesMan.data2._id;

    const registerSafe= await collectionStatements.createSafe(safe, Accountant.data);   

    const registerClient= await client.addClient(Client, logAdmin.data); 
  
    const clientId = registerClient.data.data._id;
    
//testing data
  let Statement = {
    "clientId":clientId,
    "userId": salesManId,
    "amount": 25,
    "comment": "ah"
  };
  const newStatement = await collectionStatements.collectMoney(clientId,Statement,registerSalesMan.data);
  const StatementId = newStatement.data.data._id;

//calling the tested function on our testing data
    const UpdatedSafe = await collectionStatements.approveCollectionStatement(StatementId,registerSafe.data.data._id,newStatement,registerAccountant.data);
    const acceptedStatement = await collectionStatements.getStatement(StatementId);

//checking to see if the returned data matches our expectations
    expect(acceptedStatement.data.data.state).toEqual("accepted");

//deleting the created data
    await client.deleteTest(clientId);
    await user.deleteTest(salesManId);
    await user.deleteTest(Accountant);
    await collectionStatements.EraseSafe(UpdatedSafe.data.data2._id);
    await collectionStatements.deleteCollectionStatement(StatementId);
});