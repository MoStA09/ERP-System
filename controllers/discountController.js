const Discount = require('../models/Discount');
const Client = require('../models/Client');
const Product = require('../models/Product');
const objectId = require("mongoose").Types.ObjectId;

//we need user authorization
exports.createDiscount = async function (req, res) {
    const clientId = req.params.clientId;
    const productId = req.params.productId;
    let startDate = req.body.startDate;
    let endDate = req.body.endDate;
    const percentage = req.body.percentage;
  
    if (!clientId || !productId || !startDate || !endDate || !percentage) {
        return res.send( {error : "نقص فى بعض البيانات"} );
    } 
    if (!objectId.isValid(clientId)) {
        return res.send({ error: 'Invalid clientId type' });
    } 
    if (!objectId.isValid(productId)) {
        return res.send({ error: 'Invalid productId type' });
    }
    if (percentage <= 0 || percentage > 100) {
        return res.send({ error: 'لا يمكن عمل خصم بهذه النسبة' });
    }
  
    try {      
        startDate = new Date(startDate);
        endDate = new Date(endDate);
        const dateToday = new Date();      
        dateToday.setHours(00);
        dateToday.setMinutes(00);
        dateToday.setSeconds(00);
        dateToday.setMilliseconds(00);
        if (startDate < dateToday || endDate < dateToday) {
            return res.send({error: "تاريخ الخصم لا يمكن أن يكون تاريخ منتهي"});
        }   
        if (endDate < startDate) {
            return res.send({error: "تاريخ البداية لا يمكن أن يكون بعد تاريخ النهاية"});
        }  
        //discount applies through all the end date day
        endDate.setDate(endDate.getDate() + 1);

        const client = await Client.findById(clientId);
        if (!client) {
           return res.send({error: "هذا العميل غير موجود"});
        }
        //checking if the product belongs to the client
        let productFound = false;
        for (let i = 0; i < client.products.length; i++) {
            if (productId == client.products[i].productId) {
                productFound = true;
            }
        }    
        const product = await Product.findById(productId);
        if (!product || !productFound) {
           return res.send({error: "هذا المنتج غير موجود"});
        }
        const newDiscount = await Discount.create( { clientId, productId, startDate, endDate, percentage } );
        return res.send({ data: newDiscount, msg: 'تم إضافة الخصم بنجاح' });
    } catch (error) {
      return res.send({ error: error.toString() });
    }
};
exports.deleteTest = async (req, res) => {
    try {
        const deletedDiscount = await Discount.findByIdAndDelete(req.params.id);
        res.send( { data: deletedDiscount } );
    } catch (error) {
        return res.send({ error: error.toString() });
    } 
  }