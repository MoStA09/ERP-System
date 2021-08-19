const { default: Axios } = require('axios');

const CollectionStatement = {
    // default: async () => {
    //     return await axios.get('http://localhost:5000/api/admins/')
    // },
    collectMoney: async (clientId, req, token) => {
        Axios.defaults.headers.common['Authorization'] = token 
        return await Axios.post(`http://localhost:5000/api/collectionStatements/collectMoney/${clientId}`,req);
    },  
    editCollectionStatement: async (collectionStatementId,req, token) => {
        Axios.defaults.headers.common['Authorization'] = token 
        return await Axios.put(`http://localhost:5000/api/collectionStatements/edit/${collectionStatementId}`,req);
    },
    approveCollectionStatement: async (collectionStatementId, safeId, req, token) => {
        Axios.defaults.headers.common['Authorization'] = token 
        return await Axios.post(`http://localhost:5000/api/collectionStatements/approve/${collectionStatementId}/${safeId}`,req);
    },
    disapproveCollectionStatement: async (collectionStatementId,req, token) => {
        Axios.defaults.headers.common['Authorization'] = token 
        return await Axios.patch(`http://localhost:5000/api/collectionStatements/disapprove/${collectionStatementId}`,req);
    },  
    deleteCollectionStatement: async (collectionStatementId) => {
        return await Axios.delete(`http://localhost:5000/api/collectionStatements/deleteCollectionStatementTest/${collectionStatementId}`)
    }, 
    getStatement: async (collectionStatementId) => {
        return await Axios.get(`http://localhost:5000/api/collectionStatements/getStatement/${collectionStatementId}`)
    }, 
    createSafe: async (req) => {
        return await Axios.post(`http://localhost:5000/api/safes/createSafe`,req);
    }, 
    EraseSafe: async (safeId) => {
        return await Axios.delete(`http://localhost:5000/api/safes/EraseSafe/${safeId}`);
    }, 
}

module.exports = CollectionStatement