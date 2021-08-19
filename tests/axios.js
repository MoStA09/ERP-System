//just you can import this file as axios and don't write the link on every request 
const  axiosReq = require('axios');

exports.axios = axiosReq.create({
  baseURL: 'http://localhost:5000/api/', 
});  