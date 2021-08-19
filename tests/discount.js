const  { axios } = require("./axios");
const discount = {
    createDiscount: async (req, clientId,productId,token) => {
        axios.defaults.headers.common['Authorization'] = token;
        return await axios.post(`discounts/createDiscount/${clientId}/${productId}`, req);     
    },
    deleteTest: async (discountId) => { 
        return await axios.delete(`discounts/deleteTest/${discountId}`); 
    }
}
module.exports = discount;