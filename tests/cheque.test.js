const cheque = require("./cheque");
const utils = require("./utils");
const client = require("./client");
const user = require("./user");
const safe = require("./safe");

test("Create cheque",async()=>{

    jest.setTimeout(500000);
    const currentDate = new Date();
    const collectionDate = new Date(currentDate.getFullYear()+1,1,1);
    
    const testCheque = {
        amount: 50,
        comment: "testComment",
        collectionDate: collectionDate
    }
    const testClient = {
        name: "createChequeTestClient"
    }
    const testUserCollector = {
        username: "createChequeTestUserCollector",
        password: "1234",
        type: "collector"
    }

    const adminToken = await utils.loginAdmin();
    const addClientRes = await client.addClient(testClient,adminToken.data);
    const clientId = addClientRes.data.data._id;
    
    const collectorToken = await utils.createTestUser(testUserCollector,adminToken.data);
    const collectorId = collectorToken.data2._id;

    const res = await cheque.createCheque(testCheque,clientId,collectorToken.data);

    expect(typeof(res)).not.toBe('undefined');

    expect(res.status).toEqual(200);

    expect(res).toHaveProperty('data.data');

    expect(res.data.data.userId).toEqual(collectorId);
    expect(res.data.data.clientId).toEqual(clientId);
    expect(res.data.data.history).toHaveLength(1);
    expect(res.data.data.history[0].comment).toEqual('Creation: testComment');
    expect(res.data.data.amount).toEqual(50);
    expect(res.data.data.state).toEqual('on hold');
    expect(new Date(res.data.data.creationDate).toDateString()).toEqual(currentDate.toDateString());
    expect(new Date(res.data.data.collectionDate)).toEqual(collectionDate);

    await cheque.deleteTest(res.data.data._id);
    await client.deleteTest(clientId);
    await user.deleteTest(collectorId);
});

test("Approve cheque to safe",async()=>{

    jest.setTimeout(500000);
    const currentDate = new Date();
    const collectionDate = new Date(currentDate.getFullYear()+1,1,1);
    
    const testCheque = {
        amount: 50,
        comment: "testComment",
        collectionDate: collectionDate
    }
    const testClient = {
        name: "approveChequeToSafeTestClient"
    }
    const testUserCollector = {
        username: "approveChequeToSafeTestUserCollector",
        password: "1234",
        type: "collector"
    }
    const testUserAccountant = {
        username: "approveChequeToSafeTestUserAccountant",
        password: "1234",
        type: "accountant"
    }

    const testSafe = {
        name: "approveChequeToSafeTestSafe",
        currency: "EGP",
        type: "Safe"
    }

    const adminToken = await utils.loginAdmin();
    const addClientRes = await client.addClient(testClient,adminToken.data);
    const clientId = addClientRes.data.data._id;
    
    var collectorToken = await utils.createTestUser(testUserCollector,adminToken.data);
    var collectorId = collectorToken.data2._id;
    const createChequeRes = await cheque.createCheque(testCheque,clientId,collectorToken.data);
    const chequeId = createChequeRes.data.data._id;
    await user.deleteTest(collectorId);

    const accountantToken = await utils.createTestUser(testUserAccountant,adminToken.data);
    const accountantId = accountantToken.data2._id;
    const createSafeRes = await safe.createSafe(testSafe,accountantToken.data);
    const safeId = createSafeRes.data.data._id;

    const res = await cheque.approveChequeToSafe({comment: "approved cheque"},chequeId,safeId,accountantToken.data);
    const safeTransaction = res.data.data;
    const updatedSafe = res.data.data2;

    collectorToken = await utils.createTestUser(testUserCollector,adminToken.data);
    collectorId = collectorToken.data2._id;
    const updatedCheque = await cheque.getCheque(chequeId,collectorToken.data);
    await user.deleteTest(collectorId);

    expect(typeof(res)).not.toBe('undefined');

    expect(res.status).toEqual(200);

    expect(res).toHaveProperty('data.data');

    expect(updatedCheque.data.data._id).toEqual(chequeId);
    expect(updatedCheque.data.data.history).toHaveLength(2);
    expect(updatedCheque.data.data.state).toEqual('in safe');

    expect(updatedSafe._id).toEqual(safeId);
    expect(updatedSafe.amount).toEqual(50);

    expect(safeTransaction.safeId).toEqual(safeId);
    expect(safeTransaction.userId).toEqual(accountantId);
    expect(safeTransaction.amount).toEqual(50);
    expect(safeTransaction.type).toEqual('cheque');
    expect(safeTransaction.direction).toEqual('in');


    await cheque.deleteTest(chequeId);
    await safe.deleteTest(safeId);
    await safe.deleteSafeTransactionTest(safeTransaction._id);
    await client.deleteTest(clientId);
    await user.deleteTest(accountantId);
});

test("Approve cheque to Bank",async()=>{

    jest.setTimeout(500000);
    const currentDate = new Date();
    const collectionDate = new Date(currentDate.getFullYear()+1,1,1);
    
    const testCheque = {
        amount: 50,
        comment: "testComment",
        collectionDate: collectionDate
    }
    const testClient = {
        name: "approveChequeToBankTestClient"
    }
    const testUserCollector = {
        username: "approveChequeToBankTestUserCollector",
        password: "1234",
        type: "collector"
    }
    const testUserAccountant = {
        username: "approveChequeToBankTestUserAccountant",
        password: "1234",
        type: "accountant"
    }

    const testSafe = {
        name: "approveChequeToBankTestSafe",
        currency: "EGP",
        type: "Bank"
    }

    const adminToken = await utils.loginAdmin();
    const addClientRes = await client.addClient(testClient,adminToken.data);
    const clientId = addClientRes.data.data._id;
    
    var collectorToken = await utils.createTestUser(testUserCollector,adminToken.data);
    var collectorId = collectorToken.data2._id;
    const createChequeRes = await cheque.createCheque(testCheque,clientId,collectorToken.data);
    const chequeId = createChequeRes.data.data._id;
    await user.deleteTest(collectorId);

    const accountantToken = await utils.createTestUser(testUserAccountant,adminToken.data);
    const accountantId = accountantToken.data2._id;
    const createSafeRes = await safe.createSafe(testSafe,accountantToken.data);
    const safeId = createSafeRes.data.data._id;

    const res = await cheque.approveChequeToBank({comment: "approved cheque"},chequeId,safeId,accountantToken.data);
    const safeTransaction = res.data.data;
    const updatedSafe = res.data.data2;

    collectorToken = await utils.createTestUser(testUserCollector,adminToken.data);
    collectorId = collectorToken.data2._id;
    const updatedCheque = await cheque.getCheque(chequeId,collectorToken.data);
    await user.deleteTest(collectorId);

    expect(typeof(res)).not.toBe('undefined');

    expect(res.status).toEqual(200);

    expect(res).toHaveProperty('data.data');

    expect(updatedCheque.data.data._id).toEqual(chequeId);
    expect(updatedCheque.data.data.history).toHaveLength(2);
    expect(updatedCheque.data.data.state).toEqual('in bank');

    expect(updatedSafe._id).toEqual(safeId);
    expect(updatedSafe.amount).toEqual(50);

    expect(safeTransaction.safeId).toEqual(safeId);
    expect(safeTransaction.userId).toEqual(accountantId);
    expect(safeTransaction.amount).toEqual(50);
    expect(safeTransaction.type).toEqual('cheque');
    expect(safeTransaction.direction).toEqual('in');


    await cheque.deleteTest(chequeId);
    await safe.deleteTest(safeId);
    await safe.deleteSafeTransactionTest(safeTransaction._id);
    await client.deleteTest(clientId);
    await user.deleteTest(accountantId);
});

test("disapprove cheque",async()=>{

    jest.setTimeout(500000);
    const currentDate = new Date();
    const collectionDate = new Date(currentDate.getFullYear()+1,1,1);
    
    const testCheque = {
        amount: 50,
        comment: "testComment",
        collectionDate: collectionDate
    }
    const testClient = {
        name: "approveChequeToBankTestClient"
    }
    const testUserCollector = {
        username: "approveChequeToBankTestUserCollector",
        password: "1234",
        type: "collector"
    }
    const testUserAccountant = {
        username: "approveChequeToBankTestUserAccountant",
        password: "1234",
        type: "accountant"
    }

    const adminToken = await utils.loginAdmin();
    const addClientRes = await client.addClient(testClient,adminToken.data);
    const clientId = addClientRes.data.data._id;
    
    var collectorToken = await utils.createTestUser(testUserCollector,adminToken.data);
    var collectorId = collectorToken.data2._id;
    const createChequeRes = await cheque.createCheque(testCheque,clientId,collectorToken.data);
    const chequeId = createChequeRes.data.data._id;
    await user.deleteTest(collectorId);

    const accountantToken = await utils.createTestUser(testUserAccountant,adminToken.data);
    const accountantId = accountantToken.data2._id;

    const res = await cheque.disapproveCheque({comment: "Disapproved cheque"},chequeId,accountantToken.data);

    expect(typeof(res)).not.toBe('undefined');

    expect(res.status).toEqual(200);

    expect(res).toHaveProperty('data.data');

    expect(res.data.data._id).toEqual(chequeId);
    expect(res.data.data.history).toHaveLength(2);
    expect(res.data.data.state).toEqual('rejected');


    await cheque.deleteTest(chequeId);
    await client.deleteTest(clientId);
    await user.deleteTest(accountantId);
});