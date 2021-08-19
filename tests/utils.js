const users = require("./user");

exports.loginAdmin = async () => {
  const itLogin =  await users.login({username:"admin",password:"admin"});
  return itLogin.data;
};

exports.createTestUser = async (user,adminToken) => {
  try{
    await users.createUser(user,adminToken); 
    const logInUser = await users.login(user);
      
    return logInUser.data;
  }catch(e){
   return e;
  }
};
  