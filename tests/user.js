// const axios = require('axios');
const  { axios } = require("./axios");
 
const users = {
    default: async () => {
        return await axios.get(`users`);
    },
    addTeamMembers:async(req,supervisorId,token)=>{
        axios.defaults.headers.common['Authorization'] = token;
        return await axios.patch(`users/addTeamMembers/${supervisorId}`,req);  
    } ,
    createUser: async (req,token) => {  
        axios.defaults.headers.common['Authorization'] = token;
        return await axios.post(`users/register`,req); 
    },
    login: async (req,token) => { 
        axios.defaults.headers.common['Authorization'] = token || null;
        return await axios.post(`users/login`,req); 
    },
    deleteUser: async (id,token) => { 
        axios.defaults.headers.common['Authorization'] = token;
        return await axios.patch(`users/deleteUser/${id}`);   
    },
    updateUser:async(req,token)=>{
        axios.defaults.headers.common['Authorization'] = token;
        return await axios.patch(`users/updateUser`,req);
    },
    deleteTest: async (id) => { 
        return await axios.delete(`users/deleteTest/${id}`);    
    },
}; 
 
module.exports = users ;    