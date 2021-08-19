const  { axios } = require("./axios");
const products = {
    addProduct: async (req, token) => {
        axios.defaults.headers.common['Authorization'] = token;
        return await axios.post('products/addProduct', req);     
    },
    deleteProduct: async (productId, token) => {
        axios.defaults.headers.common['Authorization'] = token;
        return await axios.delete(`products/deleteProduct/${productId}`);     
    },
    deleteTest: async (productId) => { 
        return await axios.delete(`products/deleteTest/${productId}`); 
    }
}
module.exports = products;