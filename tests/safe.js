const  { axios } = require("./axios");


const safes = {
    createSafe: async (req, token) => {
        axios.defaults.headers.common['Authorization'] = token;
        return await axios.post('safes/createSafe', req);     
    },
    payOutMoney: async (req,safeId,token) => { 
      axios.defaults.headers.common['Authorization'] = token;
      return await axios.post(`safes/payOutMoneyFromSafe/${safeId}`,req); 
    },
    addMoneyToSafe : async (req,safeId,token) => {
      axios.defaults.headers.common['Authorization'] = token;
      return await axios.post(`safes/addMoneyToSafe/${safeId}`,req);
    },
    deleteSafe : async (req,safeId,token) => {
      axios.defaults.headers.common['Authorization'] = token;
      return await axios.patch(`safes/deleteSafe/${safeId}`,req);
    },
    deleteTest : async (safeId) => {
      return await axios.delete(`safes/deleteTest/${safeId}`);
    },
    deleteSafeTransactionTest : async (id) => {
      return await axios.delete(`safes/deleteSafeTransactionTest/${id}`);
    }
}


module.exports = safes;