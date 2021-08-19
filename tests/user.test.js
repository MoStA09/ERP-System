const users = require("./user");
const { deleteTest, login, deleteUser,updateUser } = require("./user");
const { createTestUser , loginAdmin} = require("./utils");
const bcrypt = require('bcryptjs');

const userBody = {
  username : "testU",
  password : "test",
  type : "sales supervisor"
};  

test("should register user", async () => {
  //the specified timeout by jest.setTimeout.Timeout is 5000 ms and the function always takes longer than that so it fails
  jest.setTimeout(500000);
  const logAdmin = await loginAdmin();
  
  const registerUser = await createTestUser(userBody,logAdmin.data);

  await deleteTest(registerUser.data2._id);
  expect(registerUser).toHaveProperty('data'); 
  expect(registerUser).toHaveProperty('data2');      
});        

test("should login user", async () => {  
  //the specified timeout by jest.setTimeout.Timeout is 5000 ms and the function always takes longer than that so it fails
  jest.setTimeout(500000); 
  const logAdmin = await loginAdmin();
  await createTestUser(userBody,logAdmin.data);

  const loginUser = await login(userBody); 

  await deleteTest(loginUser.data.data2._id);
  expect(loginUser).toHaveProperty('data.data');  
  expect(loginUser).toHaveProperty('data.data2');      
}); 
test("the  user should have deleted equal true", async () => {     
  //the specified timeout by jest.setTimeout.Timeout is 5000 ms and the function always takes longer than that so it fails
  jest.setTimeout(500000);
  const logAdmin = await loginAdmin();
  const registerUser = await createTestUser(userBody,logAdmin.data);  

  const res = await deleteUser(registerUser.data2._id ,logAdmin.data);
      
  await deleteTest(registerUser.data2._id);  

  expect(res.data.data).toEqual("تم مسح المستخدم بنجاح");    
});   

 

test("add team members sales",async() =>{
  jest.setTimeout(500000);

  var logAdmin = await loginAdmin();

  const salesman1Body = {
    username : "test1",
    password : "test",
    type : "salesman"
  };  
  const salesman2Body = {
    username : "test2",
    password : "test",
    type : "salesman"
  };  
  const salesman3Body = {
    username : "test3",
    password : "test",
    type : "salesman"
  };  
  const salessupervisorBody = {
    username : "testsupervisor",
    password : "test",
    type : "sales supervisor"
  };  
    const registerSalesman1 = await createTestUser(salesman1Body,logAdmin.data);
    logAdmin = await loginAdmin();
    const registerSalesman2 = await createTestUser(salesman2Body,logAdmin.data);
    logAdmin = await loginAdmin();
    const registerSalesman3 = await createTestUser(salesman3Body,logAdmin.data);
    logAdmin = await loginAdmin();
    const registerSalesSuperVisor = await createTestUser(salessupervisorBody,logAdmin.data);
    const addTeamMembersBody = {teamMembers:[registerSalesman1.data2._id,registerSalesman2.data2._id,registerSalesman3.data2._id]};
    const addTeamMembersRes= await users.addTeamMembers(addTeamMembersBody,registerSalesSuperVisor.data2._id,registerSalesSuperVisor.data);
    expect(addTeamMembersRes.status).toEqual(200);
    expect(addTeamMembersRes).toHaveProperty('data.data');
    expect(typeof(addTeamMembersRes)).not.toBe('undefined');
    expect(addTeamMembersRes.data.data.teamMembers.length).toBe(3);  
  

    await deleteTest(registerSalesman1.data2._id);
    await deleteTest(registerSalesman2.data2._id);
    await deleteTest(registerSalesman3.data2._id);
    await deleteTest(registerSalesSuperVisor.data2._id);

});


test("add team members accountant",async() =>{
  jest.setTimeout(500000);

  var logAdmin = await loginAdmin();

  const accountant1Body = {
    username : "test1",
    password : "test",
    type : "accountant"
  };  
  const accountant2Body = {
    username : "test2",
    password : "test",
    type : "accountant"
  };  
  const accountant3Body = {
    username : "test3",
    password : "test",
    type : "accountant"
  };  
  const accountingSupervisorBody = {
    username : "testsupervisor",
    password : "test",
    type : "accounting supervisor"
  };  
    const registerAccountant1 = await createTestUser(accountant1Body,logAdmin.data);
    logAdmin = await loginAdmin();
    const registerAccountant2 = await createTestUser(accountant2Body,logAdmin.data);
    logAdmin = await loginAdmin();
    const registerAccountant3 = await createTestUser(accountant3Body,logAdmin.data);
    logAdmin = await loginAdmin();
    const registerAccountingSuperVisor = await createTestUser(accountingSupervisorBody,logAdmin.data);
    const addTeamMembersBody = {teamMembers:[registerAccountant1.data2._id,registerAccountant2.data2._id,registerAccountant3.data2._id]};
    const addTeamMembersRes= await users.addTeamMembers(addTeamMembersBody,registerAccountingSuperVisor.data2._id,registerAccountingSuperVisor.data);
    expect(addTeamMembersRes.status).toEqual(200);
    expect(addTeamMembersRes).toHaveProperty('data.data');
    expect(typeof(addTeamMembersRes)).not.toBe('undefined');
    expect(addTeamMembersRes.data.data.teamMembers.length).toBe(3);  
  

    await deleteTest(registerAccountant1.data2._id);
    await deleteTest(registerAccountant2.data2._id);
    await deleteTest(registerAccountant3.data2._id);
    await deleteTest(registerAccountingSuperVisor.data2._id);

});

test("update user", async () => {
  //the specified timeout by jest.setTimeout.Timeout is 5000 ms and the function always takes longer than that so it fails
  jest.setTimeout(500000);
  const logAdmin = await loginAdmin();
  const registerUser = await createTestUser(userBody, logAdmin.data);
  const updateUserBody = { username: "updatedUsernameTest", oldPassword:"test",newPassword: "asdddddd"};
  const updateUserRes = await updateUser(updateUserBody, registerUser.data);
  expect(updateUserRes.status).toBe(200);
  expect(updateUserRes).toHaveProperty('data.data');
  expect(updateUserRes.data.data.username).toBe(updateUserBody.username);
  expect(await bcrypt.compare(updateUserBody.newPassword, updateUserRes.data.data.password)).toBe(true);
  await deleteTest(registerUser.data2._id);
});
