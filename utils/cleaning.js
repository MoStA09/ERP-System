const mongoose = require('mongoose');
const readline = require('readline');
const db = require('../config/keys').mongoURI;
const  { axios } = require("../tests/axios");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

//Getting Mongo's connection URI

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

//Connecting to MongoDB
mongoose
  .connect(db)
  .then(() => {console.log("Connected to MongoDB"); createAdmin();})
  .catch((err) => console.log(err));

async function createAdmin(){
    rl.question('Are you sure you want to drop your database? y/n ', async (answer) => {
        
        if(answer !== "y") {
            console.log("Proccess has been ended, nothing happened ;)");
            await mongoose.connection.close();
            rl.close();
            return;
        }
        await mongoose.connection.dropDatabase();
        const res = await axios.post(`users/registerTest`,{username:"admin",password:"admin", type:"it"});
        if(res.data.data){
            console.log("User type IT has been created successfully")
        }
        else{
            console.log("User type IT has not been created")
        }
        await mongoose.connection.close();
        console.log("The Database has been cleaned and we inserted the IT")

        rl.close();
    });
}