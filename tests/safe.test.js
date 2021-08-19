const { createSafe, deleteTest,payOutMoney, addMoneyToSafe, deleteSafe ,deleteSafeTransactionTest } = require("./safe");
const users = require("./user");
const { loginAdmin, createTestUser } = require("./utils") 
  
test('should create a safe and return the new safe', async () => {
  jest.setTimeout(500000);
  const logAdmin = await loginAdmin();
  const user = await createTestUser({username:"testSq",password:"test",type:"accountant"},logAdmin.data);

  
    const body = {
      userId : user.data2._id,
      name : "test1",
      currency : "EGP",
      type: "Safe"
    };
    const res = await createSafe(body,user.data);
  
    //delete safe
    await deleteTest(res.data.data._id);
    //delete user
    await users.deleteTest(user.data2._id);

    expect(res.data.data.name).toEqual(body.name);
  
});

test('should pay out money from a safe and return the new amount', async () => {
  jest.setTimeout(500000);
  const logAdmin = await loginAdmin();
  const user = await createTestUser({username:"test2s",password:"test2",type:"accountant"},logAdmin.data);


    const body = {
      userId : user.data2._id,
      name : "test2",
      currency : "EGP",
      type: "Safe"
    };
    const res = await createSafe(body,user.data);

    //add money to safe
    const addMoney = await addMoneyToSafe({
      userId : user.data2._id,
      type: "cash",
      comment : "add Money",
      amount : 700 
    },
    res.data.data._id,
    user.data
    )

    const payMoney = await payOutMoney(
      {
        userId:user.data2._id,
        type:"cash",
        amount : 400,
      },
      res.data.data._id,
      user.data
      );

    //delete safe
    await deleteTest(res.data.data._id);
    //delete user
    await users.deleteTest(user.data2._id);
    //delete transactions
    await deleteSafeTransactionTest(addMoney.data.data._id);
    await deleteSafeTransactionTest(payMoney.data.data._id); 

   // the amount should be 300 after adding 700 then pay 400 so the remaining amount should be 300   
    expect(payMoney.data.data2.amount).toEqual(300); 
  
});

test('should add money to safe and return the new amount', async () => {
  jest.setTimeout(500000);
  const logAdmin = await loginAdmin();
  const user = await createTestUser({username:"testx",password:"test",type:"accountant"},logAdmin.data);


    const body = {
      userId : user.data2._id,
      name : "test1",
      currency : "EGP",
      type: "Safe"
    };
    const res = await createSafe(body,user.data);

    //add money to safe
    const addMoney = await addMoneyToSafe({
      userId : user.data2._id,
      type: "cash",
      comment : "add Money",
      amount : 700 
    },
    res.data.data._id,
    user.data
    )
    //delete safe
    await deleteTest(res.data.data._id);
    //delete user
    await users.deleteTest(user.data2._id);
    //delete transactions
    await deleteSafeTransactionTest(addMoney.data.data._id);

   // the amount should be 700 after adding 700 to the safe 
    expect(addMoney.data.data2.amount).toEqual(700); 
  
});

test('should change deleted from false to true to delete the safe', async () => {
  jest.setTimeout(500000);
  const logAdmin = await loginAdmin();
  const user = await createTestUser({username:"testb",password:"test3",type:"accountant"},logAdmin.data);


    const body = {
      userId : user.data2._id,
      name : "test3",
      currency : "EGP",
      type: "Safe"
    };
    const res = await createSafe(body,user.data);

    const deletedSafe = await deleteSafe({userId:user.data2._id},res.data.data._id,user.data);

 
    //delete safe
    await deleteTest(res.data.data._id);
    //delete user
    await users.deleteTest(user.data2._id);

   // the deleted property should be true 
    expect(deletedSafe.data.data.deleted).toEqual(true); 
  
});
