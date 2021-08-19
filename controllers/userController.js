
const User = require("../models/User");
const Invoice = require("../models/Invoice");
const CollectionStatement = require('../models/CollectionStatement');
const objectId = require('mongoose').Types.ObjectId;
const bcrypt = require('bcryptjs');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const tokenKey = require('../config/keys').secretOrKey;
const { convertMapToObject } = require('../utils/convertMapToObject');

exports.getAllUsers = async function (req, res) {
  const pageNo = parseInt(req.params.page);
  if(pageNo <= 0) return res.send({error:'page number must be greater than 0 '});
  const pageSize = parseInt(req.params.size);
  if(pageSize <= 0) return res.send({error:'page size must be greater than 0 '});
  const users = await User.aggregate([
    {$match : {deleted: {$ne: true}}},
    // {$sort: {[sort]:order}},
    {$project: {password: 0}},
    {$facet:{
        users: [{ $skip: (pageNo-1) * pageSize }, { $limit: pageSize}],
        totalCount: [{ $count: 'count' }]
      }}
    ]);
  return res.send({ data: users[0] });
};

exports.getUsersType = async function (req, res) {
  const pageNo = parseInt(req.params.page);
  if(pageNo <= 0) return res.send({error:'page number must be greater than 0 '});
  const pageSize = parseInt(req.params.size);
  if(pageSize <= 0) return res.send({error:'page size must be greater than 0 '});
  let type = req.params.type
  let query = type === "all"? {deleted: {$ne: true}}:{type:type, deleted: {$ne: true}};
  const users = await User.aggregate([
    {$match : query},
    // {$sort: {[sort]:order}},
    {$project: {password: 0}},
    {$facet:{
        users: [{ $skip: (pageNo-1) * pageSize }, { $limit: pageSize}],
        totalCount: [{ $count: 'count' }]
      }}
    ]);
  return res.send({ data: users[0] });
};

exports.registerUser = async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;
  const type = req.body.type;
  if (!username || !password || !type)
    return res.send({ error: 'Missing some requirments!' });
  req.body.password = await bcrypt.hash(req.body.password, 12);
  try {
    req.body.teamMembers = [];
    const newUser = await User.create(req.body);
    return res.send({ data: newUser });
  } catch (err) {
    return res.send({ error: 'username is already taken' });
  }
};

exports.login = async function (req, res, next) {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password)
    return res.send({ error: "Missing some requirments!" })
  passport.authenticate("users", async function (err, user, message) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.send({ error: message.message });
    }
    req.login(user, async function (err) {
      try {
        if (err) {
          return next(err);
        }
        const payload = await User.findOne({ "username": username });
        const token = jwt.sign(payload.toJSON(), tokenKey, {});
        return res.json({ data: `Bearer ${token}`, data2: payload });
      } catch (err) {
        return err;
      }
    });
  })(req, res, next);
};

// exports.editUser = async (req, res) => {
//   const userId = req.params.id;
//   if (!userId) return res.send({ error: "missing parameter userID" })

//   try {
//     const { requestUserId, newPassword, username, oldPassword } = req.body;

//     const requestUser = await User.findById(requestUserId);
//     if (!requestUser) return res.send({ error: "there is no user with that id" });

//     const user = await User.findById(userId);
//     if (!user) return res.send({ error: "there is no user with that id" });


//     if (requestUser.type === "it") {
//       if (newPassword) {
//         user.password = await bcrypt.hash(newPassword, 12);
//       }

//       if (username) {
//         if (username.length < 3) {
//           return res.send({ error: "the username must be more than 3 charecters" });
//         }
//         user.username = username;
//       }

//       const newUser = await user.save();

//       return res.send({ data: newUser });
//     }


//     if (!newPassword) {
//       return res.send({ error: "please provide a password" });
//     }

//     const isPsswordTrue = await bcrypt.compare(oldPassword, user.password);

//     if (!isPsswordTrue) {
//       return res.send({ error: 'the old password is incorrect' })
//     }
//     user.password = await bcrypt.hash(newPassword, 12);

//     const newUser = await user.save();

//     return res.send({ data: newUser });

//   } catch (err) {
//     return res.send({ error: err.toString() })
//   }

// }

exports.editUser = async function (req, res) {

  const user = req.user;
  const username = req.body.username;
  let newPassword = req.body.newPassword;

  try {
    let userToEdit;
    if (user.type === 'it') {
      if (!req.body.id)
        userToEdit = user;
      else
        userToEdit = await User.findById(req.body.id);  

    } else {
      userToEdit = user;
    }

    if(!username && !newPassword)
      return res.send({ error: 'Please provide a username or a new password' });

    if (username) {
      userToEdit.username = username;
    }

    if (newPassword) {
      newPassword = await bcrypt.hash(newPassword, 12);
      //If user is IT change the password without the need of checking the old password
      if (user.type === 'it' && user._id !== userToEdit._id) {
        userToEdit.password = newPassword;
      } else if (req.body.oldPassword) { //If user is not IT then check if oldPassword exists else send error

        //Checking if oldPassword matches the user password
        const check = await bcrypt.compare(req.body.oldPassword, userToEdit.password);
        if (check) {
          userToEdit.password = newPassword;
        } else {
          return res.send({ error: 'Incorrect password' });
        }
      } else {
        return res.send({ error: 'Please provide your old password' });
      }
    }

    const updatedUser = await userToEdit.save();
    return res.send({ data: updatedUser });

  } catch (error) {
    return res.send({ error: error.toString() });
  }

}


exports.addTeamMembers = async (req, res) => {
  const { supervisorId } = req.params;
  const { teamMembers } = req.body;
  if (!supervisorId) {
    return res.send({ error: 'missing parameter supervisorId' });
  }
  if (!teamMembers) {
    return res.send({ error: 'missing  team members array' });
  }
  try {
    let supervisor = await User.findById(supervisorId);
    if (!supervisor || !supervisor.type.includes('supervisor')) {
      return res.send({ error: "there is no subervisor with that id" });
    }



    for (let i = 0; i < teamMembers.length; i++) {
      if (!objectId.isValid(teamMembers[i])) {
        return res.send( {error: "team member ID must be an objectId"} );
      }
      if (supervisor.teamMembers.includes(teamMembers[i])) {
        return res.send({ error: 'the user is already a team member of this supervisor' })
      }

      const member = await User.findById(teamMembers[i]);
      if (!member) {
        return res.send({ error: `there is no user with that id` })
      }

      if (member.type.includes('supervisor')) {
        return res.send({ error: `you can't add a supervisor as a team member` })
      }
      const supervisorType = supervisor.type;
      const memberType = member.type;

      switch (supervisorType) {
        case "sales supervisor":
          if (memberType === "salesman") {
            supervisor.teamMembers.push(teamMembers[i]);
          } else {
            return res.send({ error: `you must add a only a salesman to a sales supervisor as a team member` })
          }
          break;
        case "accounting supervisor":
          if (memberType === "accountant") {
            supervisor.teamMembers.push(teamMembers[i]);
          } else {
            return res.send({ error: `you must add a only a accountant to a sales accounting supervisor as a team member` })
          }
          break;
        default:
          return res.send({ error: `the supervisor must be a sales supervisor or accounting supervisor only` })
      }
    }

    supervisor = await supervisor.save({ validateBeforeSave: true })

    return res.send({ data: supervisor })
  } catch (err) {
    return res.send({ error: err.toString() });
  }

};

exports.getAllSalesSupervisors = async function (req, res) {
  let users = await User.find();
  let salesSupervisors = [];

  for (var i = 0; i < users.length; i++) {
    var x = users[i].type;
    x = x.toString();
    if (x === "sales supervisor") {
      salesSupervisors.push(JSON.parse(JSON.stringify(users[i])));
    }
  }
  for (var i = 0; i < salesSupervisors.length; i++) {
    var x = salesSupervisors[i].teamMembers;
    salesSupervisors[i].teamList = [];
    for (var j = 0; j < x.length; j++) {
      let salesManId = salesSupervisors[i].teamMembers[j];
      let salesMan = await User.findOne({ _id: salesManId });
      salesSupervisors[i].teamList.push(salesMan)
    }
  }
  return res.send({ data: salesSupervisors });
};


exports.getAllSalesMen = async function (req, res) {
  
  let users = req.user;
  let salesMen = [];
  users = JSON.parse(JSON.stringify(users));
  for (var i = 0; i < users.teamMembers.length; i++) {
    let salesManId = users.teamMembers[i];
    let salesMan = await User.findOne({ _id: salesManId }, { password: 0 });
    salesMen.push(salesMan)
  }
  return res.send({ data: salesMen });
};


exports.deleteUser = async (req, res) => {
  const userId = req.params.id;
  if (!userId) return res.send({ error: 'there is no parameter in the request' });

  try {
    let user = await User.findByIdAndUpdate(userId, {
      deleted: true,
    });
    if (!user) return res.send({ error: 'لا يوجد مستخدم ب هذا الرقم' });

    return res.send({ data: 'تم مسح المستخدم بنجاح' });

  } catch (e) {
    return res.send({ error: e.toString() });
  }
};

//we need user authorization
exports.getSalesManStatistics = async (req, res) => {
  let startDate = req.params.startDate;
  let endDate = req.params.endDate;

  try {
    //Check if the user exists
    let salesMan = req.user;
    
    salesMan = await getSalesMan(salesMan, startDate, endDate);
    res.send( {data: salesMan} );
  } catch (err) {
    return res.send({error: err.toString()});
  }
}

//we need user authorization
exports.getSalesTeamStatistics = async (req, res) => {
  let startDate = req.params.startDate;
  let endDate = req.params.endDate;
  
  try {
    //Check if the user exists
    let salesSupervisor = req.user;
    
    let salesMen = salesSupervisor.teamMembers;
    salesMen = JSON.parse(JSON.stringify(salesMen));
    for(let i = 0; i < salesMen.length; i++) {
      salesMen[i] = await User.findById(salesMen[i], { password: 0 });
      salesMen[i] = await getSalesMan(salesMen[i], startDate, endDate);
    }
    return res.send( {data: salesMen} );
  } catch (err) {
    return res.send({error: err.toString()});
  }
}

//we need user authorization
exports.getAllSalesMenStatistics = async (req, res) => {
  try {
    let startDate = req.params.startDate;
    let endDate = req.params.endDate;
    let salesMen = await User.find( {type: 'salesman'} , { password: 0 });
    for(let i = 0; i < salesMen.length; i++) {
      salesMen[i] = await getSalesMan(salesMen[i], startDate, endDate);
    }
    return res.send({data: salesMen});
  } catch(err) {
    return res.send({error: err.toString()});
  }
}

getSalesMan = async function(salesMan, startDate, endDate) {
  let userQuery = { userId: salesMan._id };
  let dateQuery = {};
  endDate = new Date(endDate);
  endDate.setHours(23);
  endDate.setMinutes(59);
  endDate.setSeconds(59);

  //no specific start date, get all statistics till that end date
  if (startDate === 'all') {    
    dateQuery = { creationDate: { $lte : endDate } };
  } 
  else {
    startDate = new Date(startDate);
    dateQuery = { creationDate: { $lte : endDate,  $gte : startDate } };
  }

  //get collection statements made by that sales man
  const collectionStatements = await CollectionStatement.find( { $and: [userQuery, dateQuery ]} );
  const invoices = await Invoice.aggregate([
    //match with salesman id, given dates
    { $match: { $and: [userQuery, dateQuery ]} },
    { $facet: {
      //get invoices of type 'invoice' or 'returnInvoice' made by that sales man to calculate quantity of products sold
      bothInvoiceTypes: [ { $match: { type: { $in: ['invoice', 'returnInvoice'] } } } ],
      //get invoices made by that sales man
      invoices: [ { $match: { type: 'invoice'} } ],
      //get returnInvoices made by that sales man
      returnInvoices: [ { $match: { type: 'returnInvoice'} } ],
      //get number of invoices made relative to each client
      clientInvoices: [ { $match: { type: 'invoice'} }, { $group: { _id : "$clientId", count: { $sum: 1 } } } ],
      //get number of returnInvoices made relative to each client
      clientReturnInvoices: [ { $match: { type: 'returnInvoice'} }, { $group: { _id : "$clientId", count: { $sum: 1 } } } ],
    }} 
  ]);

  salesMan = JSON.parse(JSON.stringify(salesMan));
  salesMan.collectionStatements = collectionStatements;
  salesMan.invoices = invoices[0].invoices;
  salesMan.returnInvoices = invoices[0].returnInvoices;
  salesMan.clientInvoices = invoices[0].clientInvoices;
  salesMan.clientReturnInvoices = invoices[0].clientReturnInvoices;

  //get quantity sold from each product from invoices and return invoices
  let productsMap = new Map();
  for (let i = 0; i < invoices[0].bothInvoiceTypes.length; i++) {
    let products = invoices[0].bothInvoiceTypes[i].products;
    for (let j = 0; j < products.length; j++) {
      let newQuantity = 0;
      invoices[0].bothInvoiceTypes[i].type === 'invoice'? newQuantity += products[j].quantity : newQuantity -= products[j].quantity; //quantity in the invoice
      if (productsMap.has( String(products[j].productId) )) {
        newQuantity += productsMap.get(String(products[j].productId));
      }
      productsMap.set(String(products[j].productId), newQuantity);
    }
  }
  salesMan.products = convertMapToObject(productsMap);
  return salesMan;
}

exports.deleteTest = async (req,res) => {
  const id = req.params.id;
  if(!id) return res.send({error: "no params in  request "});
  try{
    const deletedUser = await User.findByIdAndDelete(id);

    return res.send({data : deletedUser});

  }catch(e){
    return res.send({error : e.toString()});
  }
} 