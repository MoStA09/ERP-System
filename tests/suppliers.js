const  { axios } = require("./axios");
const suppliers = {
    createSupplier: async (req, token) => {
        axios.defaults.headers.common['Authorization'] = token
        return await axios.post("suppliers/createSupplier", req);
    },
    deleteTest: async (id) => {
        return await axios.delete(`suppliers/deleteTest/${id}`);
    },
    addProductsToSupplier: async (req, supplierId, token) => {
        axios.defaults.headers.common['Authorization'] = token
        return await axios.patch(`suppliers/addProductsToSupplier/${supplierId}`, req);
    },
    removeProductsFromSupplier: async(req,supplierId,token) =>{
        axios.defaults.headers.common['Authorization'] = token
        return await axios.patch(`suppliers/removeProductsFromSupplier/${supplierId}`,req);
    },
    editSupplierName:async(req,supplierId,token)=>{
        axios.defaults.headers.common['Authorization'] = token
        return await axios.patch(`suppliers/editSupplierName/${supplierId}`,req);

    },
    editPriceOfSpecifiedProducts:async(req,supplierId,token)=>{
        axios.defaults.headers.common['Authorization'] = token
        return await axios.patch(`suppliers/editPriceOfProducts/${supplierId}`,req);
    }
};
module.exports = suppliers;