const  { axios } = require("./axios");

const cheques = {
    createCheque: async (req,clientId,token) => {
        axios.defaults.headers.common['Authorization'] = token;
        return await axios.post(`cheques/createCheque/${clientId}`, req)
    },
    approveChequeToSafe: async (req,chequeId,safeId,token) => {
        axios.defaults.headers.common['Authorization'] = token;
        return await axios.patch(`cheques/approveChequeToSafe/${chequeId}/${safeId}`, req)
    },
    approveChequeToBank: async (req,chequeId,safeId,token) => {
        axios.defaults.headers.common['Authorization'] = token;
        return await axios.patch(`cheques/approveChequeToBank/${chequeId}/${safeId}`, req)
    },
    disapproveCheque: async (req,chequeId,token) => {
        axios.defaults.headers.common['Authorization'] = token;
        return await axios.patch(`cheques/disapproveCheque/${chequeId}`, req)
    },
    getCheque: async (chequeId,token) => {
        axios.defaults.headers.common['Authorization'] = token;
        return await axios.get(`cheques/getCheque/${chequeId}`)
    },
    deleteTest: async (chequeId) => {
        return await axios.delete(`cheques/deleteTest/${chequeId}`)
    }
}
module.exports = cheques