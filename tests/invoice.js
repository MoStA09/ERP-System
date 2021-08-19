const  { axios } = require("./axios");

const link  = `http://localhost:5000/api/`;

const invoices = {
    default: async () => {
        return await axios.get(`invoices`);
    }, 
    createInvoice: async (req,clientId,subClientName,token) => { 
        axios.defaults.headers.common['Authorization'] = token;
        return await axios.post(`invoices/createInvoice/${clientId}/${subClientName}`,req); 
    },
    editInvoice: async (req,id,token) => {
        axios.defaults.headers.common['Authorization'] = token;
        return await axios.post(`invoices/editInvoice/${id}`,req);
    },
    scheduleFutureInvoice: async (req,clientId,subClientName,token) => { 
        axios.defaults.headers.common['Authorization'] = token;
        return await axios.post(`invoices/scheduleFutureInvoice/${clientId}/${subClientName}`,req); 
    }, 
    scheduleInvoiceToSalesman: async (req,clientId,subClientName,supervisorId,token)=>{  
        axios.defaults.headers.common['Authorization'] = token;
        return await axios.post(`invoices/scheduleInvoiceToSalesman/${clientId}/${subClientName}/${supervisorId}`,req); 
    },
    editFutureInvoice: async (req,id,token)=>{ 
        axios.defaults.headers.common['Authorization'] = token;
        return await axios.post(`invoices/editFutureInvoice/${id}`,req); 
    },
    createEmptyInvoice: async (req,clientId,token)=>{ 
        axios.defaults.headers.common['Authorization'] = token;
        return await axios.post(`invoices/createEmptyInvoice/${clientId}`,req); 
    },
    createEmptyReturnInvoice: async (req,clientId,token)=>{  
        axios.defaults.headers.common['Authorization'] = token;
        return await axios.post(`invoices/createEmptyReturnInvoice/${clientId}`,req); 
    },
    deleteInvoice: async (id,token)=>{ 
        axios.defaults.headers.common['Authorization'] = token;
        return await axios.delete(`invoices/deleteInvoice/${id}`); 
    }
}; 

module.exports = invoices ; 