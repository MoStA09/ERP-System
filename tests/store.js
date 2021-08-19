const  { axios } = require("./axios");
const stores = {
    createStore: async (req, token) => {
        axios.defaults.headers.common['Authorization'] = token;
        return await axios.post('stores/createStore', req);     
    },
    addProductsWithQuantity: async (req, storeId, token) => {
        axios.defaults.headers.common['Authorization'] = token;
        return await axios.patch(`stores/addProductQuantity/${storeId}`, req);     
    },
    removeProductsWithQuantity: async (req, storeId, token) => {
        axios.defaults.headers.common['Authorization'] = token;
        return await axios.patch(`stores/removeProductQuantity/${storeId}`, req);     
    },
    addProductQuantityWithSupplier: async (req, storeId, token) => {
        axios.defaults.headers.common['Authorization'] = token;
        return await axios.patch(`stores/addProductQuantityWithSupplier/${storeId}`, req);     
    },
    removeProductQuantityWithSupplier: async (req, storeId, token) => {
        axios.defaults.headers.common['Authorization'] = token;
        return await axios.patch(`stores/removeProductQuantityWithSupplier/${storeId}`, req);     
    },
    deleteStore: async (storeId, token) => {
        axios.defaults.headers.common['Authorization'] = token;
        return await axios.patch(`stores/deleteAnEmptyStore/${storeId}`);     
    },
    deleteTest: async (storeId) => { 
        return await axios.delete(`stores/deleteTest/${storeId}`); 
    }
}
module.exports = stores;