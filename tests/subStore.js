const { axios } = require("./axios");
const stores = require("./store");
const subStores = {
    createSubStore: async (req, storeId, token) => {
        axios.defaults.headers.common['Authorization'] = token;
        return await axios.post(`subStores/createSubStore/${storeId}`, req);
    },
    addProductQuantityFromStore:async (req,storeId,subStoreId,token) => {
        axios.defaults.headers.common['Authorization'] = token;
        return await axios.patch(`subStores/addProductQuantityFromStor/${storeId}/${subStoreId}`,req);
    },
    returnProductQuantity:async(req,storeId,substoreId,token) =>{
        axios.defaults.headers.common['Authorization'] = token;
        return await axios.patch(`subStores/returnProductQuantityToStore/${storeId}/${substoreId}`,req);
    },
    removeQuantitySubStore:async(req,subStoreId,storeId,token)=>{
        axios.defaults.headers.common['Authorization'] = token;
        return await axios.patch(`subStores/removeQuantitySubStore/${subStoreId}/${storeId}`,req);
    },
    deleteAnEmptySubStore:async(req,substoreId,token)=>{
        return await axios.patch(`subStores/deleteAnEmptySubStore/${substoreId}`,req);
    },
    deleteTest: async (subStoreId) => {
        return await axios.delete(`subStores/deleteTest/${subStoreId}`);
    }
}
module.exports = subStores;