const { default: Axios } = require('axios');

const Expenses = {
    // default: async () => {
    //     return await axios.get('http://localhost:5000/api/admins/')
    // },
    addCategory: async (req, token) => {
        Axios.defaults.headers.common['Authorization'] = token 
        return await Axios.post('http://localhost:5000/api/expenses/addCategory',req)
    },  
    addSubCategory: async (expenseId,req,token) => {
        Axios.defaults.headers.common['Authorization'] = token 
        return await Axios.patch(`http://localhost:5000/api/expenses/addSubCategory/${expenseId}`,req)
    },
    addField: async (expenseId,req,token) => {
        Axios.defaults.headers.common['Authorization'] = token 
        return await Axios.patch(`http://localhost:5000/api/expenses/addField/${expenseId}`,req)
    },
    addExpensesTransaction: async (expenseId,req,token) => {
        Axios.defaults.headers.common['Authorization'] = token 
        return await Axios.post(`http://localhost:5000/api/expenses/addExpensesTransaction/${expenseId}`,req)
    },  
    deleteExpense: async (expenseId) => {
        return await Axios.delete(`http://localhost:5000/api/expenses/deleteExpense/${expenseId}`)
    },  
}

module.exports = Expenses