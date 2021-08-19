const  { axios } = require("./axios");

const clients = {
    addClient: async (req,token) => {
        axios.defaults.headers.common['Authorization'] = token;
        return await axios.post(`clients/addClient`, req)
    },
    addSubClient: async (req,clientId,token) => {
        axios.defaults.headers.common['Authorization'] = token;
        return await axios.patch(`clients/addSubClient/${clientId}`, req)
    },
    editSubClient: async (req,clientId,token) => {
        axios.defaults.headers.common['Authorization'] = token;
        return await axios.put(`clients/editSubClient/${clientId}`, req)
    },
    editClient: async (req,clientId,token) => {
        axios.defaults.headers.common['Authorization'] = token;
        return await axios.put(`clients/editClient/${clientId}`, req)
    },
    deleteClient: async (clientId,token) => {
        axios.defaults.headers.common['Authorization'] = token;
        return await axios.patch(`clients/deleteClient/${clientId}`)
    },
    deleteSubClient: async (req,clientId,token) => {
        axios.defaults.headers.common['Authorization'] = token;
        return await axios.patch(`clients/deleteSubClient/${clientId}`, req)
    },
    deleteTest: async (clientId) => {
        return await axios.delete(`clients/deleteTest/${clientId}`)
    }
}
module.exports = clients